import { describe, expect, it } from "vitest";
import { renderDocument } from "./document-rendering.service.js";

describe("document rendering service", () => {
  it("renders an optimized CV as a PDF buffer", async () => {
    const buffer = await renderDocument({
      type: "optimized-cv",
      data: {
        fullName: "Taylor Smith",
        email: "taylor@example.com",
        phone: null,
        location: "Berlin",
        linkedin: null,
        portfolio: null,
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
        education: [],
        skills: ["TypeScript", "React"],
        languages: [],
        certifications: [],
      },
    });

    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
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
  });
});
