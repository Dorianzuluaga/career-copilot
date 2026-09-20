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
    professionalTitle: null,
    email: "taylor@example.com",
    phone: "+1 555 0100",
    location: "Berlin",
    linkedin: null,
    website: null,
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
    workingLanguage: "es",
  },
  optimizedCv: {
    fullName: "Taylor Smith",
    professionalTitle: null,
    email: "taylor@example.com",
    phone: "+1 555 0100",
    location: "Berlin",
    linkedin: null,
    website: null,
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
    workingLanguage: null,
  },
  skillProfile: {
    skills: [
      {
        sourceSkill: "TypeScript",
        canonicalSkill: "TS",
        category: "Front-End",
        professionalWeight: "core_professional",
        jobRelevance: "very_high",
        priority: 1,
        evidence: [{ source: "experience", reference: "experience[0]" }],
      },
      {
        sourceSkill: "REST APIs",
        canonicalSkill: "REST",
        category: "Back-End",
        professionalWeight: "core_professional",
        jobRelevance: "high",
        priority: 2,
        evidence: [{ source: "experience", reference: "experience[0]" }],
      },
      {
        sourceSkill: "Git",
        canonicalSkill: "Git",
        category: "Development Tools",
        professionalWeight: "general",
        jobRelevance: "none",
        priority: 3,
        evidence: [],
      },
    ],
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
  it("formats the date as an unambiguous UTC calendar date", () => {
    expect(formatCoverLetterDate(new Date("2026-08-07T12:00:00.000Z"))).toBe(
      "2026-08-07",
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
      "fr",
      new Date("2026-08-07T12:00:00.000Z"),
    );

    expect(coverLetter).toEqual({
      candidateName: "Taylor Smith",
      email: "taylor@example.com",
      phone: "+1 555 0100",
      date: "2026-08-07",
      companyName: "Acme",
      greeting: "Dear Hiring Manager,",
      introduction: "I am applying for the Software Engineer role.",
      professionalValue: "I have built TypeScript APIs.",
      motivation: "I want to contribute to Acme's product work.",
      closing: "Thank you for your consideration.",
      signature: "Taylor Smith",
      workingLanguage: "fr",
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
      generateCoverLetterDraft(
        input,
        "es",
        new Date("2026-08-07T12:00:00.000Z"),
      ),
    ).resolves.toEqual({
      candidateName: "Taylor Smith",
      email: "taylor@example.com",
      phone: "+1 555 0100",
      date: "2026-08-07",
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
      workingLanguage: "es",
    });

    expect(createResponse).toHaveBeenCalledOnce();
    expect(createResponse.mock.calls[0][0].input[0].content[0].text).toContain(
      "Spanish (es)",
    );
    const payload = JSON.parse(
      createResponse.mock.calls[0][0].input[1].content[0].text as string,
    ) as CoverLetterGenerationInput;
    expect(payload.skillProfile).toEqual(input.skillProfile);
    const prompt = createResponse.mock.calls[0][0].input[0].content[0]
      .text as string;
    expect(prompt).toContain(
      "Use the provided Skill Profile as the shared skill-reasoning context.",
    );
    expect(prompt).toContain(
      "Do not independently reconstruct skill priority from raw Master CV, Job Analysis, Profile Match, or Optimized CV skill lists.",
    );
    expect(prompt).toContain(
      "Emphasize existing professional skills with higher Skill Profile priority and jobRelevance.",
    );
    expect(prompt).toContain(
      "Use Skill Profile evidence only to ground those existing skills in Master CV sections that already support them.",
    );
    expect(prompt).toContain(
      "Document-facing skill strings must be sourceSkill.",
    );
    expect(prompt).toContain("Never use canonicalSkill in Cover Letter prose.");
    expect(prompt).toContain(
      "Master CV remains the authoritative candidate skill inventory.",
    );
    expect(prompt).toContain(
      "Do not copy Profile Match matchingSkills or missingSkills, Job Analysis requiredSkills or atsKeywords, or canonicalSkill into the Cover Letter as candidate skills.",
    );
    expect(prompt).toContain("Preserve factual accuracy at all times.");
    expect(prompt).toContain(
      "Do not invent professional experience, achievements, personal motivations, or company information.",
    );
    expect(prompt).toContain(
      "Do not infer company values that are not explicitly present in the Job Analysis.",
    );
    expect(prompt).toContain(
      "Do not claim knowledge about the company that is not supported by the Job Analysis.",
    );
    expect(prompt).toContain("Do not modify factual profile information.");
    expect(prompt).toContain("Do not promise future performance or outcomes.");
    expect(prompt).toContain(
      "The saved Optimized CV is the primary document reference.",
    );
    expect(prompt).toContain(
      "Complement the Optimized CV instead of repeating it.",
    );
  });

  it("rejects invalid AI responses", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({ greeting: "Dear Hiring Manager," }),
    });

    await expect(generateCoverLetterDraft(input, "en")).rejects.toThrow(
      "Invalid cover letter response.",
    );
  });
});
