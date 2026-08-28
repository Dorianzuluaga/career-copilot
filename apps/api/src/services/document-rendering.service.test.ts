import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import type { OptimizedCv } from "../types/optimized-cv.js";
import { renderDocument } from "./document-rendering.service.js";

const sampleOptimizedCv: OptimizedCv = {
  fullName: "Taylor Smith",
  professionalTitle: null,
  email: "taylor@example.com",
  phone: null,
  location: "Berlin",
  linkedin: null,
  website: null,
  professionalSummary: "TypeScript engineer building APIs.",
  experience: [
    {
      jobTitle: "Software Engineer",
      company: "Acme",
      location: "Remote",
      startDate: "2020",
      endDate: null,
      current: true,
      description: "Built REST APIs with TypeScript.",
    },
  ],
  education: [
    {
      institution: "Example University",
      degree: "BSc",
      fieldOfStudy: "Computer Science",
      startDate: "2016",
      endDate: "2020",
      description: "Studied software engineering.",
    },
  ],
  skills: ["TypeScript", "React"],
  languages: [{ name: "English", proficiency: "Fluent" }],
  certifications: [
    {
      name: "AWS Cloud Practitioner",
      issuer: "Amazon",
      issueDate: "2022",
      credentialUrl: null,
    },
  ],
};

const selectedPersonalProject = {
  name: "Career Copilot",
  technologies: "TypeScript · React",
  url: "https://example.com/career-copilot",
  description: "Job-specific CV workspace for Fast Apply.",
};

function pageCount(buffer: Buffer): number {
  const text = buffer.toString("latin1");
  const match = text.match(/\/Type\s*\/Pages[\s\S]{0,400}?\/Count\s+(\d+)/);
  if (match) {
    return Number(match[1]);
  }
  return (text.match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
}

function extractPdfText(buffer: Buffer): string {
  const raw = buffer.toString("latin1");
  const streams = [...raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)];
  const chunks: string[] = [];

  for (const match of streams) {
    const bytes = Buffer.from(match[1], "latin1");
    try {
      chunks.push(inflateSync(bytes).toString("latin1"));
    } catch {
      chunks.push(match[1]);
    }
  }

  return (
    chunks
      .join("\n")
      .match(/<([0-9a-fA-F]+)>/g)
      ?.map((value) =>
        Buffer.from(value.slice(1, -1), "hex").toString("latin1"),
      )
      .join("")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  );
}

describe("document rendering service", () => {
  it("renders an optimized CV as a PDF buffer", async () => {
    const buffer = await renderDocument({
      type: "optimized-cv",
      data: sampleOptimizedCv,
    });

    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(pageCount(buffer)).toBe(1);
  });

  it("renders selected personal projects on one page without mutating the CV", async () => {
    const cv: OptimizedCv = {
      ...sampleOptimizedCv,
      personalProjects: [selectedPersonalProject],
    };
    const original = structuredClone(cv);

    const buffer = await renderDocument({
      type: "optimized-cv",
      data: cv,
    });
    const text = extractPdfText(buffer);

    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(pageCount(buffer)).toBe(1);
    expect(text).toContain("PERSONAL PROJECTS");
    expect(text).toContain(selectedPersonalProject.name);
    expect(text).toContain(selectedPersonalProject.technologies);
    expect(text).toContain(selectedPersonalProject.url);
    expect(text).toContain(selectedPersonalProject.description);
    expect(cv).toEqual(original);
  });

  it("omits the personal projects section when none are selected", async () => {
    const withoutField = await renderDocument({
      type: "optimized-cv",
      data: sampleOptimizedCv,
    });
    const withEmpty = await renderDocument({
      type: "optimized-cv",
      data: { ...sampleOptimizedCv, personalProjects: [] },
    });

    expect(pageCount(withoutField)).toBe(1);
    expect(pageCount(withEmpty)).toBe(1);
    expect(extractPdfText(withoutField)).not.toContain("PERSONAL PROJECTS");
    expect(extractPdfText(withEmpty)).not.toContain("PERSONAL PROJECTS");
    expect(extractPdfText(withoutField)).not.toContain("Career Copilot");
    expect(extractPdfText(withEmpty)).not.toContain("Career Copilot");
  });

  it("renders the structured header and omits empty optional fields", async () => {
    const allFields: OptimizedCv = {
      ...sampleOptimizedCv,
      professionalTitle: "Full Stack Developer",
      phone: "+1 555 0100",
      linkedin: "https://linkedin.com/in/taylor",
      website: "https://example.com/very/long/portfolio-path",
    };
    const requiredOnly: OptimizedCv = {
      ...sampleOptimizedCv,
      professionalTitle: null,
      phone: null,
      location: null,
      linkedin: null,
      website: null,
    };
    const partialPairs: OptimizedCv = {
      ...sampleOptimizedCv,
      professionalTitle: null,
      phone: null,
      location: "Berlin",
      linkedin: null,
      website: null,
    };
    const migratedWebsite: OptimizedCv = {
      ...sampleOptimizedCv,
      website: "https://example.com/old-portfolio",
    };

    const allText = extractPdfText(
      await renderDocument({ type: "optimized-cv", data: allFields }),
    );
    const requiredText = extractPdfText(
      await renderDocument({ type: "optimized-cv", data: requiredOnly }),
    );
    const partialText = extractPdfText(
      await renderDocument({ type: "optimized-cv", data: partialPairs }),
    );
    const migratedText = extractPdfText(
      await renderDocument({ type: "optimized-cv", data: migratedWebsite }),
    );

    expect(allText).toContain("Taylor Smith");
    expect(allText).toContain("Full Stack Developer");
    expect(allText).toContain("+1 555 0100");
    expect(allText).toContain("taylor@example.com");
    expect(allText).toContain("Berlin");
    expect(allText).toContain("https://linkedin.com/in/taylor");
    expect(allText).toContain("https://example.com/very/long/portfolio-path");
    expect(allText).not.toContain(
      "taylor@example.com · +1 555 0100 · Berlin · https://linkedin.com/in/taylor · https://example.com/very/long/portfolio-path",
    );

    expect(requiredText).toContain("Taylor Smith");
    expect(requiredText).toContain("taylor@example.com");
    expect(requiredText).not.toContain("Full Stack Developer");
    expect(requiredText).not.toContain("+1 555 0100");
    expect(requiredText).not.toContain("Berlin");
    expect(requiredText).not.toContain("https://linkedin.com/in/taylor");
    expect(requiredText).not.toContain("https://example.com");

    expect(partialText).toContain("taylor@example.com");
    expect(partialText).toContain("Berlin");
    expect(partialText).not.toContain("+1 555 0100");
    expect(partialText).not.toContain("https://linkedin.com/in/taylor");

    expect(migratedText).toContain("https://example.com/old-portfolio");
  });

  it("does not backfill professional title from later Master CV values", async () => {
    const savedSnapshot: OptimizedCv = {
      ...sampleOptimizedCv,
      professionalTitle: null,
    };
    const text = extractPdfText(
      await renderDocument({ type: "optimized-cv", data: savedSnapshot }),
    );

    expect(text).toContain("Taylor Smith");
    expect(text).not.toContain("Full Stack Developer");
  });

  it("renders a cover letter as a PDF buffer", async () => {
    const buffer = await renderDocument({
      type: "cover-letter",
      data: {
        candidateName: "Taylor Smith",
        email: "taylor@example.com",
        phone: null,
        date: "August 8, 2026",
        companyName: "Acme",
        greeting: "Dear Hiring Manager,",
        introduction: "I am writing to apply.",
        professionalValue: "I build TypeScript APIs.",
        motivation: "I want to join Acme.",
        closing: "Thank you.",
        signature: "Taylor Smith",
      },
    });

    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    const text = extractPdfText(buffer);
    expect(text).toContain("Taylor Smith");
    expect(text).toContain("taylor@example.com");
    expect(text).not.toContain("Software Engineer");
    expect(text).not.toContain("https://linkedin.com");
    expect(text).not.toContain("https://example.com");
  });
});
