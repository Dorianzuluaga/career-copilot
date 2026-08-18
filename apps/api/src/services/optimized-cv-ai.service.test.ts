import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { OptimizedCvGenerationInput } from "../types/optimized-cv.js";

const { createResponse } = vi.hoisted(() => ({
  createResponse: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAIMock {
    responses = { create: createResponse };
  },
}));

import {
  enforceMasterCvIntegrity,
  generateOptimizedCvDraft,
} from "./optimized-cv-ai.service.js";

const originalApiKey = process.env.OPENAI_API_KEY;

const input: OptimizedCvGenerationInput = {
  masterCv: {
    fullName: "Taylor Smith",
    email: "taylor@example.com",
    phone: null,
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
    skills: ["TypeScript", "REST APIs", "PostgreSQL"],
    languages: [{ name: "English", proficiency: "Fluent" }],
    certifications: [
      {
        name: "AWS Cloud Practitioner",
        issuer: "Amazon",
        issueDate: "2022",
        credentialUrl: null,
      },
    ],
    personalProjects: [
      {
        name: "Career Copilot",
        description: "AI career assistant built with TypeScript.",
        technologies: "TypeScript, React",
        url: "https://example.com/career-copilot",
      },
      {
        name: "Humidity Project",
        description: "IoT humidity monitor.",
        technologies: "Python",
        url: null,
      },
      {
        name: "Unrelated Project",
        description: "A personal blog.",
        technologies: "WordPress",
        url: null,
      },
    ],
  },
  jobAnalysis: {
    title: "Software Engineer",
    company: "Acme",
    employmentType: "Full-time",
    location: "Remote",
    experienceLevel: "Mid-level",
    education: null,
    languages: [],
    summary: "Build web products.",
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

describe("enforceMasterCvIntegrity", () => {
  it("preserves factual Master CV fields while allowing adapted text", () => {
    const generated = {
      ...input.masterCv,
      fullName: "Changed Name",
      email: "changed@example.com",
      professionalSummary: "TypeScript engineer focused on REST APIs.",
      experience: [
        {
          jobTitle: "Invented Title",
          company: "Invented Company",
          location: "Remote",
          startDate: "2019-01",
          endDate: "2021-01",
          current: false,
          description: "Delivered TypeScript REST APIs for product teams.",
        },
      ],
      education: [
        {
          institution: "Fake University",
          degree: "MSc",
          fieldOfStudy: "AI",
          startDate: "2015",
          endDate: "2019",
          description: "Completed coursework in distributed systems.",
        },
      ],
      skills: ["REST APIs", "Invented Skill", "TypeScript"],
      languages: [{ name: "German", proficiency: "Native" }],
      certifications: [
        {
          name: "Fake Cert",
          issuer: "Fake Issuer",
          issueDate: "2024",
          credentialUrl: "https://example.com",
        },
      ],
      personalProjects: [
        {
          name: "Career Copilot",
          description: "Job-specific TypeScript career assistant.",
          technologies: "Invented Tech",
          url: "https://invented.example.com",
        },
        {
          name: "Invented Project",
          description: "Does not exist in the Master CV.",
          technologies: "Rust",
          url: null,
        },
      ],
    };

    expect(enforceMasterCvIntegrity(input.masterCv, generated)).toEqual({
      fullName: "Taylor Smith",
      email: "taylor@example.com",
      phone: null,
      location: "Berlin",
      linkedin: null,
      portfolio: null,
      professionalSummary: "TypeScript engineer focused on REST APIs.",
      experience: [
        {
          jobTitle: "Software Engineer",
          company: "Example",
          location: null,
          startDate: "2020-01",
          endDate: null,
          current: true,
          description: "Delivered TypeScript REST APIs for product teams.",
        },
      ],
      education: [
        {
          institution: "Example University",
          degree: "BSc",
          fieldOfStudy: "Computer Science",
          startDate: "2016",
          endDate: "2020",
          description: "Completed coursework in distributed systems.",
        },
      ],
      skills: ["REST APIs", "TypeScript", "PostgreSQL"],
      languages: [{ name: "English", proficiency: "Fluent" }],
      certifications: [
        {
          name: "AWS Cloud Practitioner",
          issuer: "Amazon",
          issueDate: "2022",
          credentialUrl: null,
        },
      ],
      personalProjects: [
        {
          name: "Career Copilot",
          description: "Job-specific TypeScript career assistant.",
          technologies: "TypeScript, React",
          url: "https://example.com/career-copilot",
        },
      ],
    });
  });

  it("omits Personal Projects when none are selected", () => {
    expect(
      enforceMasterCvIntegrity(input.masterCv, {
        ...input.masterCv,
        personalProjects: [],
      }),
    ).toMatchObject({ personalProjects: [] });
  });

  it("drops invented Personal Projects and preserves Master CV identity fields", () => {
    const result = enforceMasterCvIntegrity(input.masterCv, {
      ...input.masterCv,
      personalProjects: [
        {
          name: "Humidity Project",
          description: "Relevant IoT monitoring for the role.",
          technologies: "Invented",
          url: "https://invented.example.com",
        },
        {
          name: "Missing Project",
          description: "Invented",
          technologies: null,
          url: null,
        },
      ],
    });

    expect(result.personalProjects).toEqual([
      {
        name: "Humidity Project",
        description: "Relevant IoT monitoring for the role.",
        technologies: "Python",
        url: null,
      },
    ]);
  });

  it("keeps Personal Projects empty when the Master CV has none", () => {
    const masterCv = {
      ...input.masterCv,
      personalProjects: [],
    };

    expect(
      enforceMasterCvIntegrity(masterCv, {
        ...masterCv,
        personalProjects: [
          {
            name: "Invented Project",
            description: "Should not appear.",
            technologies: null,
            url: null,
          },
        ],
      }).personalProjects,
    ).toEqual([]);
  });
});

describe("generateOptimizedCvDraft", () => {
  it("returns an integrity-enforced Optimized CV from the AI draft", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        ...input.masterCv,
        fullName: "Changed Name",
        professionalSummary: "TypeScript engineer focused on REST APIs.",
        experience: [
          {
            ...input.masterCv.experience[0],
            company: "Changed Company",
            description: "Delivered TypeScript REST APIs for product teams.",
          },
        ],
        skills: ["TypeScript", "REST APIs", "PostgreSQL"],
        personalProjects: [
          {
            name: "Career Copilot",
            description: "Job-specific TypeScript career assistant.",
            technologies: "Invented Tech",
            url: "https://invented.example.com",
          },
          {
            name: "Unrelated Project",
            description: "A personal blog.",
            technologies: "WordPress",
            url: null,
          },
        ],
      }),
    });

    await expect(generateOptimizedCvDraft(input)).resolves.toEqual({
      ...input.masterCv,
      professionalSummary: "TypeScript engineer focused on REST APIs.",
      experience: [
        {
          ...input.masterCv.experience[0],
          description: "Delivered TypeScript REST APIs for product teams.",
        },
      ],
      personalProjects: [
        {
          name: "Career Copilot",
          description: "Job-specific TypeScript career assistant.",
          technologies: "TypeScript, React",
          url: "https://example.com/career-copilot",
        },
        {
          name: "Unrelated Project",
          description: "A personal blog.",
          technologies: "WordPress",
          url: null,
        },
      ],
    });
    expect(createResponse).toHaveBeenCalledOnce();
    const prompt = createResponse.mock.calls[0][0].input[0].content[0]
      .text as string;
    expect(prompt).toContain("single A4 page");
    expect(prompt).toContain("one-page fit");
    expect(prompt).toContain("3-4 bullets");
    expect(prompt).toContain(
      "Do not invent professional experience, projects, achievements, skills, education, languages, or certifications.",
    );
    expect(prompt).toContain(
      "Do not modify personal information, employment dates, company names, job titles",
    );
    expect(prompt).toContain(
      "Evaluate Master CV personalProjects against the Job Analysis and Profile Match.",
    );
    expect(prompt).toContain("Include only relevant Personal Projects.");
    expect(prompt).toContain("Omit irrelevant Personal Projects.");
    expect(prompt).toContain(
      "Do not control fonts, margins, spacing, columns, or visual layout.",
    );
  });

  it("throws when OpenAI is not configured", async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(generateOptimizedCvDraft(input)).rejects.toThrow(
      "OpenAI is not configured.",
    );
  });
});
