import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { CoverLetterGenerationInput } from "../types/cover-letter.js";

const { createResponse } = vi.hoisted(() => ({
  createResponse: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAIMock {
    responses = { create: createResponse };
  },
}));

import {
  assembleCoverLetter,
  formatCoverLetterDate,
  generateCoverLetterDraft,
} from "./cover-letter-ai.service.js";

const originalApiKey = process.env.OPENAI_API_KEY;

const input: CoverLetterGenerationInput = {
  masterCv: {
    fullName: "Taylor Smith",
    email: "taylor@example.com",
    phone: "+1 555 0100",
    location: "Berlin",
    linkedin: null,
    portfolio: null,
    professionalSummary: "Software engineer building web APIs.",
    experience: [
      {
        jobTitle: "Software Engineer",
        company: "Example",
        location: null,
        startDate: "2020-01",
        endDate: null,
        current: true,
        description: "Built REST APIs with TypeScript.",
      },
    ],
    education: [],
    skills: ["TypeScript", "REST APIs"],
    languages: [],
    certifications: [],
  },
  jobAnalysis: {
    title: "Software Engineer",
    company: "Acme",
    employmentType: "Full-time",
    location: "Remote",
    experienceLevel: "Mid-level",
    education: null,
    languages: [],
    summary: "Build web products for global customers.",
    requiredSkills: ["TypeScript", "REST APIs"],
    responsibilities: ["Build APIs"],
    atsKeywords: ["TypeScript", "REST", "APIs"],
  },
  profileMatch: {
    matchingSkills: ["TypeScript", "REST APIs"],
    missingSkills: [],
    strengths: ["Strong TypeScript experience for the role."],
    weaknesses: [],
    alignmentScore: 82,
    alignmentReasoning: "Core skills are well supported.",
    recommendation: "Strong opportunity. Continue with the application.",
  },
  optimizedCv: {
    fullName: "Taylor Smith",
    email: "taylor@example.com",
    phone: "+1 555 0100",
    location: "Berlin",
    linkedin: null,
    portfolio: null,
    professionalSummary: "TypeScript engineer building APIs.",
    experience: [
      {
        jobTitle: "Software Engineer",
        company: "Example",
        location: null,
        startDate: "2020-01",
        endDate: null,
        current: true,
        description: "Built TypeScript REST APIs.",
      },
    ],
    education: [],
    skills: ["TypeScript", "REST APIs"],
    languages: [],
    certifications: [],
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.OPENAI_API_KEY = "test-api-key";
});

afterAll(() => {
  if (originalApiKey === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalApiKey;
  }
});

describe("formatCoverLetterDate", () => {
  it("formats the date in a cover-letter friendly UTC form", () => {
    expect(formatCoverLetterDate(new Date("2026-08-07T12:00:00.000Z"))).toBe(
      "August 7, 2026",
    );
  });
});

describe("assembleCoverLetter", () => {
  it("injects factual header fields and the current date", () => {
    const coverLetter = assembleCoverLetter(
      input,
      {
        greeting: "Dear Hiring Manager,",
        introduction: "I am applying for the Software Engineer role.",
        professionalValue: "I have built TypeScript APIs.",
        motivation: "I want to contribute to Acme's product work.",
        closing: "Thank you for your consideration.",
      },
      new Date("2026-08-07T12:00:00.000Z"),
    );

    expect(coverLetter).toEqual({
      candidateName: "Taylor Smith",
      email: "taylor@example.com",
      phone: "+1 555 0100",
      date: "August 7, 2026",
      companyName: "Acme",
      greeting: "Dear Hiring Manager,",
      introduction: "I am applying for the Software Engineer role.",
      professionalValue: "I have built TypeScript APIs.",
      motivation: "I want to contribute to Acme's product work.",
      closing: "Thank you for your consideration.",
      signature: "Taylor Smith",
    });
  });
});

describe("generateCoverLetterDraft", () => {
  it("returns an assembled Cover Letter from the AI draft", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        greeting: "Dear Hiring Manager,",
        introduction: "I am writing to apply for the Software Engineer role.",
        professionalValue:
          "My TypeScript API experience matches the role requirements.",
        motivation:
          "I am interested in contributing to Acme based on the role summary.",
        closing:
          "Thank you for your consideration. I am available for an interview.",
      }),
    });

    await expect(
      generateCoverLetterDraft(input, new Date("2026-08-07T12:00:00.000Z")),
    ).resolves.toEqual({
      candidateName: "Taylor Smith",
      email: "taylor@example.com",
      phone: "+1 555 0100",
      date: "August 7, 2026",
      companyName: "Acme",
      greeting: "Dear Hiring Manager,",
      introduction: "I am writing to apply for the Software Engineer role.",
      professionalValue:
        "My TypeScript API experience matches the role requirements.",
      motivation:
        "I am interested in contributing to Acme based on the role summary.",
      closing:
        "Thank you for your consideration. I am available for an interview.",
      signature: "Taylor Smith",
    });

    expect(createResponse).toHaveBeenCalledOnce();
  });

  it("rejects invalid AI responses", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({ greeting: "Dear Hiring Manager," }),
    });

    await expect(generateCoverLetterDraft(input)).rejects.toThrow(
      "Invalid cover letter response.",
    );
  });
});
