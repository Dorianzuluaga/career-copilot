import { inflateSync } from "node:zlib";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  resolveCoverLetterDocumentChrome,
  resolveOptimizedCvDocumentChrome,
} from "../documents/document-localization.js";
import type { CoverLetter } from "../types/cover-letter.js";
import type { OptimizedCv } from "../types/optimized-cv.js";
import type { SupportedLocale } from "../types/supported-locale.js";
import {
  renderDocument,
  toPdfProfilePhotoSource,
} from "./document-rendering.service.js";

const englishCvChrome = resolveOptimizedCvDocumentChrome("en");

const sampleCoverLetter: CoverLetter = {
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
  workingLanguage: null,
};

function coverLetterDocument(
  data: CoverLetter,
  locale: SupportedLocale = "en",
) {
  return {
    type: "cover-letter" as const,
    data,
    chrome: resolveCoverLetterDocumentChrome(data.date, locale),
  };
}

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
  workingLanguage: null,
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

function extractPdfStreams(buffer: Buffer): string {
  const raw = buffer.toString("latin1");
  return [...raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)]
    .map((match) => {
      try {
        return inflateSync(Buffer.from(match[1], "latin1")).toString("latin1");
      } catch {
        return match[1];
      }
    })
    .join("\n");
}

function extractPdfUris(buffer: Buffer): string[] {
  return [...buffer.toString("latin1").matchAll(/\/URI\s*\(([^)]*)\)/g)].map(
    (match) => match[1],
  );
}

async function nonSquarePhoto(width: number, height: number): Promise<Buffer> {
  const vertical = width < height;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#ef4444"/>
    <rect ${vertical ? `y="${height / 2}" width="${width}" height="${height / 2}"` : `x="${width / 2}" width="${width / 2}" height="${height}"`} fill="#3b82f6"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

describe("document rendering service", () => {
  it("renders an optimized CV as a PDF buffer", async () => {
    const buffer = await renderDocument({
      type: "optimized-cv",
      chrome: englishCvChrome,
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
      chrome: englishCvChrome,
      data: cv,
    });
    const text = extractPdfText(buffer);

    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(pageCount(buffer)).toBe(1);
    expect(text).toContain("PERSONAL PROJECTS");
    expect(text).toContain(selectedPersonalProject.name);
    expect(text).toContain(selectedPersonalProject.technologies);
    expect(text).toContain(selectedPersonalProject.description);
    expect(text).toContain("Open project");
    expect(text).not.toContain(selectedPersonalProject.url);
    expect(extractPdfUris(buffer)).toContain(selectedPersonalProject.url);
    expect(text).not.toContain(
      `${selectedPersonalProject.technologies} · ${selectedPersonalProject.url}`,
    );
    const nameIndex = text.indexOf(selectedPersonalProject.name);
    const descriptionIndex = text.indexOf(selectedPersonalProject.description);
    const linkIndex = text.indexOf("Open project");
    const stackIndex = text.indexOf(
      selectedPersonalProject.technologies,
      descriptionIndex,
    );
    expect(nameIndex).toBeLessThan(descriptionIndex);
    expect(descriptionIndex).toBeLessThan(stackIndex);
    expect(stackIndex).toBeLessThan(linkIndex);
    expect(cv).toEqual(original);
  });

  it("prefixes scheme-less project hyperlink targets without changing the CV", async () => {
    const cv: OptimizedCv = {
      ...sampleOptimizedCv,
      personalProjects: [
        {
          ...selectedPersonalProject,
          url: "example.com/career-copilot",
        },
      ],
    };
    const original = structuredClone(cv);

    const buffer = await renderDocument({
      type: "optimized-cv",
      chrome: englishCvChrome,
      data: cv,
    });

    expect(extractPdfText(buffer)).not.toContain("example.com/career-copilot");
    expect(extractPdfUris(buffer)).toContain(
      "https://example.com/career-copilot",
    );
    expect(cv).toEqual(original);
  });

  it("omits the personal projects section when none are selected", async () => {
    const withoutField = await renderDocument({
      type: "optimized-cv",
      chrome: englishCvChrome,
      data: sampleOptimizedCv,
    });
    const withEmpty = await renderDocument({
      type: "optimized-cv",
      chrome: englishCvChrome,
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
      await renderDocument({
        type: "optimized-cv",
        chrome: englishCvChrome,
        data: allFields,
      }),
    );
    const requiredText = extractPdfText(
      await renderDocument({
        type: "optimized-cv",
        chrome: englishCvChrome,
        data: requiredOnly,
      }),
    );
    const partialText = extractPdfText(
      await renderDocument({
        type: "optimized-cv",
        chrome: englishCvChrome,
        data: partialPairs,
      }),
    );
    const migratedText = extractPdfText(
      await renderDocument({
        type: "optimized-cv",
        chrome: englishCvChrome,
        data: migratedWebsite,
      }),
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
      await renderDocument({
        type: "optimized-cv",
        chrome: englishCvChrome,
        data: savedSnapshot,
      }),
    );

    expect(text).toContain("Taylor Smith");
    expect(text).not.toContain("Full Stack Developer");
  });

  it("renders a cover letter as a PDF buffer", async () => {
    const buffer = await renderDocument(coverLetterDocument(sampleCoverLetter));

    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    const text = extractPdfText(buffer);
    expect(text).toContain("Taylor Smith");
    expect(text).toContain("taylor@example.com");
    expect(text).not.toContain("Software Engineer");
    expect(text).not.toContain("https://linkedin.com");
    expect(text).not.toContain("https://example.com");
  });

  it("omits the photo region when the Optimized CV snapshot is empty", async () => {
    const buffer = await renderDocument({
      type: "optimized-cv",
      chrome: englishCvChrome,
      data: sampleOptimizedCv,
    });
    const raw = buffer.toString("latin1");

    expect(raw).not.toContain("data-cv-header-photo");
    expect(raw).not.toMatch(/\/Subtype\s*\/Image/);
  });

  it("embeds a square cover-cropped photo when snapshot bytes are present", async () => {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    const buffer = await renderDocument({
      type: "optimized-cv",
      chrome: englishCvChrome,
      data: {
        ...sampleOptimizedCv,
        profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
      },
      profilePhotoBytes: png,
    });
    const raw = buffer.toString("latin1");

    expect(raw).toMatch(/\/Subtype\s*\/Image/);
    expect(raw).toContain("/SMask");
    expect(raw).not.toContain("/ShadingType 3");
    expect(pageCount(buffer)).toBe(1);
  });

  it("matches the Preview corner fade while preserving the center and straight edges", async () => {
    const source = await nonSquarePhoto(160, 80);
    const dataUrl = await toPdfProfilePhotoSource(source, 25, 50);
    const rendered = Buffer.from(dataUrl.split(",")[1], "base64");
    const { data, info } = await sharp(rendered)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pixel = (x: number, y: number) => {
      const offset = (y * info.width + x) * info.channels;
      return [...data.subarray(offset, offset + info.channels)];
    };
    const center = pixel(40, 40);
    const edge = pixel(40, 0);
    const corner = pixel(0, 0);
    let alphaDifference = 0;
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const radiusPercent =
          (Math.hypot(x + 0.5 - info.width / 2, y + 0.5 - info.height / 2) /
            (info.width / 2)) *
          100;
        const previewAlpha =
          radiusPercent <= 125
            ? 1
            : radiusPercent < 130
              ? 1 - ((radiusPercent - 125) / 5) * 0.4
              : 0.01;
        alphaDifference += Math.abs(
          pixel(x, y)[3] - Math.round(previewAlpha * 255),
        );
      }
    }

    expect(info).toMatchObject({ width: 80, height: 80, channels: 4 });
    expect(center).toEqual([239, 68, 68, 255]);
    expect(edge).toEqual(center);
    expect(corner.slice(0, 3)).toEqual(center.slice(0, 3));
    expect(corner[3]).toBeLessThan(10);
    expect(alphaDifference / (info.width * info.height)).toBeLessThan(3);
  });

  it("fails instead of silently omitting configured photo bytes", async () => {
    await expect(
      renderDocument({
        type: "optimized-cv",
        chrome: englishCvChrome,
        data: {
          ...sampleOptimizedCv,
          profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
          profilePhotoPositionX: 50,
          profilePhotoPositionY: 50,
        },
      }),
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it("applies focal positions to non-square landscape and portrait photos", async () => {
    const assetId = "7e9c843b-5c3d-4e65-8514-7de898b2aca6";
    const renderPositioned = async (
      bytes: Buffer,
      profilePhotoPositionX: number,
      profilePhotoPositionY: number,
    ) =>
      extractPdfStreams(
        await renderDocument({
          type: "optimized-cv",
          chrome: englishCvChrome,
          data: {
            ...sampleOptimizedCv,
            profilePhotoAssetId: assetId,
            profilePhotoPositionX,
            profilePhotoPositionY,
          },
          profilePhotoBytes: bytes,
        }),
      );

    const landscape = await nonSquarePhoto(160, 80);
    const portrait = await nonSquarePhoto(80, 160);
    const leading = await renderPositioned(landscape, 0, 50);
    const trailing = await renderPositioned(landscape, 100, 50);
    const top = await renderPositioned(portrait, 50, 0);
    const bottom = await renderPositioned(portrait, 50, 100);

    expect(leading).not.toBe(trailing);
    expect(top).not.toBe(bottom);
  });

  it("does not embed a photo in Cover Letter PDFs", async () => {
    const buffer = await renderDocument(coverLetterDocument(sampleCoverLetter));
    const raw = buffer.toString("latin1");

    expect(raw).not.toMatch(/\/Subtype\s*\/Image/);
    expect(raw).not.toContain("data-cv-header-photo");
  });
});

describe("document presentation localization", () => {
  it.each([
    {
      locale: "es" as const,
      summary: "RESUMEN PROFESIONAL",
      experience: "EXPERIENCIA",
      education: "FORMACIÓN",
      skills: "COMPETENCIAS",
      languages: "IDIOMAS",
      certifications: "CERTIFICACIONES",
      personalProjects: "PROYECTOS PERSONALES",
      present: "Actualidad",
      openProject: "Abrir proyecto",
      formattedDate: "8 de agosto de 2026",
    },
    {
      locale: "en" as const,
      summary: "PROFESSIONAL SUMMARY",
      experience: "EXPERIENCE",
      education: "EDUCATION",
      skills: "SKILLS",
      languages: "LANGUAGES",
      certifications: "CERTIFICATIONS",
      personalProjects: "PERSONAL PROJECTS",
      present: "Present",
      openProject: "Open project",
      formattedDate: "August 8, 2026",
    },
    {
      locale: "fr" as const,
      summary: "RÉSUMÉ PROFESSIONNEL",
      experience: "EXPÉRIENCE",
      education: "FORMATION",
      skills: "COMPÉTENCES",
      languages: "LANGUES",
      certifications: "CERTIFICATIONS",
      personalProjects: "PROJETS PERSONNELS",
      present: "Aujourd'hui",
      openProject: "Ouvrir le projet",
      formattedDate: "8 août 2026",
    },
  ])(
    "renders $locale Optimized CV chrome and Cover Letter date in the PDF",
    async ({
      locale,
      summary,
      experience,
      education,
      skills,
      languages,
      certifications,
      personalProjects,
      present,
      openProject,
      formattedDate,
    }) => {
      const chrome = resolveOptimizedCvDocumentChrome(locale);
      const cvText = extractPdfText(
        await renderDocument({
          type: "optimized-cv",
          chrome,
          data: {
            ...sampleOptimizedCv,
            personalProjects: [selectedPersonalProject],
          },
        }),
      );

      expect(cvText).toContain(summary);
      expect(cvText).toContain(experience);
      expect(cvText).toContain(education);
      expect(cvText).toContain(skills);
      expect(cvText).toContain(languages);
      expect(cvText).toContain(certifications);
      expect(cvText).toContain(personalProjects);
      expect(cvText).toContain(present);
      expect(cvText).toContain(openProject);
      expect(cvText).toContain(selectedPersonalProject.name);
      expect(cvText).toContain("TypeScript");

      const coverLetterText = extractPdfText(
        await renderDocument(coverLetterDocument(sampleCoverLetter, locale)),
      );
      expect(coverLetterText).toContain(formattedDate);
      expect(coverLetterText).toContain("Taylor Smith");
      expect(coverLetterText).not.toContain("Software Engineer");
    },
  );

  it("renders presentation-localized language entries in the PDF", async () => {
    const chrome = resolveOptimizedCvDocumentChrome("fr");
    const cvText = extractPdfText(
      await renderDocument({
        type: "optimized-cv",
        chrome,
        data: {
          ...sampleOptimizedCv,
          languages: [
            { name: "Espagnol", proficiency: "Natif" },
            { name: "Anglais", proficiency: "Intermédiaire" },
          ],
        },
      }),
    );

    expect(cvText).toContain("LANGUES");
    expect(cvText).toContain("Espagnol");
    expect(cvText).toContain("Natif");
    expect(cvText).toContain("Anglais");
    expect(cvText).toContain("Interm");
    expect(cvText).not.toContain("Español");
    expect(cvText).not.toContain("Nativo");
  });
});
