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

const validDraft = {
  greeting: "Dear Hiring Manager,",
  introduction: "I am writing to apply for the Software Engineer role.",
  professionalValue:
    "My TypeScript API experience matches the role requirements.",
  motivation:
    "I am interested in contributing to Acme based on the role summary.",
  closing: "Thank you for your consideration. I am available for an interview.",
};

function lastPrompt(): string {
  return createResponse.mock.calls[0][0].input[0].content[0].text as string;
}

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

  it("omits the candidate name from closing and keeps Master CV fullName as the only signature", () => {
    const coverLetter = assembleCoverLetter(
      input,
      {
        greeting: "Estimado equipo de contratación,",
        introduction: "Me presento para el puesto de Software Engineer.",
        professionalValue: "He desarrollado APIs con TypeScript.",
        motivation: "Quiero contribuir al producto de Acme.",
        closing:
          "Gracias por su consideración. Un cordial saludo, Taylor Smith.",
      },
      "es",
    );

    expect(coverLetter.closing).toBe(
      "Gracias por su consideración. Un cordial saludo.",
    );
    expect(coverLetter.closing).not.toMatch(/Taylor Smith/i);
    expect(coverLetter.signature).toBe("Taylor Smith");
    expect(coverLetter.signature).toBe(input.masterCv.fullName);
  });

  it("strips a trailing signature-block name without changing Master CV signature", () => {
    const coverLetter = assembleCoverLetter(
      input,
      {
        greeting: "Dear Hiring Manager,",
        introduction: "I am applying for the Software Engineer role.",
        professionalValue: "I have built TypeScript APIs.",
        motivation: "I want to contribute to Acme's product work.",
        closing:
          "Thank you for your consideration. I am available for an interview.\n\nTaylor Smith",
      },
      "en",
    );

    expect(coverLetter.closing).toBe(
      "Thank you for your consideration. I am available for an interview.",
    );
    expect(coverLetter.closing).not.toContain("Taylor Smith");
    expect(coverLetter.signature).toBe("Taylor Smith");
  });
});

describe("generateCoverLetterDraft", () => {
  it("returns an assembled Cover Letter from the AI draft", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(validDraft),
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
    expect(lastPrompt()).toContain("Spanish (es)");
    const payload = JSON.parse(
      createResponse.mock.calls[0][0].input[1].content[0].text as string,
    ) as CoverLetterGenerationInput;
    expect(payload.skillProfile).toEqual(input.skillProfile);
    const prompt = lastPrompt();
    expect(prompt).toContain(
      "Use the provided Skill Profile as the shared skill-reasoning context.",
    );
    expect(prompt).toContain(
      "Do not independently reconstruct skill priority from raw Master CV, Job Analysis, Profile Match, or Optimized CV skill lists.",
    );
    expect(prompt).toContain(
      "Use Skill Profile professionalWeight, jobRelevance, evidence, and priority to guide which existing Master CV skills receive emphasis.",
    );
    expect(prompt).toContain(
      "Use evidence only to ground selected skills in existing Master CV content.",
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

  it("includes professionalWeight with the other Skill Profile emphasis signals", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(validDraft),
    });

    await generateCoverLetterDraft(input, "en");

    const prompt = lastPrompt();
    expect(prompt).toContain("professionalWeight");
    expect(prompt).toContain(
      "Use Skill Profile professionalWeight, jobRelevance, evidence, and priority to guide which existing Master CV skills receive emphasis.",
    );
    expect(prompt).toContain(
      "Use these signals only to emphasize existing Master CV skills.",
    );
    expect(prompt).toContain("must not list every skill");
    expect(prompt).toContain(
      "Do not independently reconstruct skill priority from raw Master CV, Job Analysis, Profile Match, or Optimized CV skill lists.",
    );
    expect(prompt).toContain(
      "Document-facing skill strings must be sourceSkill.",
    );
    expect(prompt).toContain("Never use canonicalSkill in Cover Letter prose.");
  });

  it("includes Optimized CV factuality rules in the Cover Letter prompt", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(validDraft),
    });

    await generateCoverLetterDraft(input, "en");

    const prompt = lastPrompt();
    expect(prompt).toContain("Relevance does not imply expertise.");
    expect(prompt).toContain("professionalWeight does not imply seniority.");
    expect(prompt).toContain("Priority does not imply proficiency.");
    expect(prompt).toContain("Evidence does not authorize stronger claims.");
    expect(prompt).toContain("Do not turn relevance into expertise.");
    expect(prompt).toContain("Do not turn professional weight into seniority.");
    expect(prompt).toContain(
      "Do not infer language ability beyond what the Master CV explicitly states.",
    );
    expect(prompt).toContain(
      "Do not change English — Intermediate into Conversational English, fluent English, advanced English, or any other upgraded formulation.",
    );
    expect(prompt).toContain(
      "Job Analysis experienceLevel is a job requirement, not candidate seniority.",
    );
    expect(prompt).toContain(
      "Job Analysis requiredSkills and atsKeywords, and Profile Match matchingSkills and missingSkills, are not candidate skills.",
    );
    expect(prompt).toContain(
      "Do not invent technologies, professional experience, achievements, certifications, or responsibilities.",
    );
  });

  it("instructs the model not to put the candidate name in closing", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(validDraft),
    });

    await generateCoverLetterDraft(input, "en");

    const prompt = lastPrompt();
    expect(prompt).toContain(
      "The closing must contain only thanks and availability or an invitation to continue the conversation.",
    );
    expect(prompt).toContain(
      "The closing must not contain the candidate name, a signature, a signature block, or phrases such as Un cordial saludo followed by the candidate name.",
    );
    expect(prompt).toContain(
      "Do not include a signature in closing. The backend adds signature from Master CV fullName as the only signature.",
    );
  });

  it("strips a candidate name from the LLM closing and keeps Master CV fullName as signature", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        ...validDraft,
        closing:
          "Thank you for your consideration. Un cordial saludo, Taylor Smith.",
      }),
    });

    await expect(generateCoverLetterDraft(input, "es")).resolves.toEqual(
      expect.objectContaining({
        closing: "Thank you for your consideration. Un cordial saludo.",
        signature: "Taylor Smith",
        candidateName: "Taylor Smith",
      }),
    );
  });

  describe("Evidence-Based Claims prompt contract", () => {
    beforeEach(() => {
      createResponse.mockResolvedValue({
        output_text: JSON.stringify(validDraft),
      });
    });

    it("uses relevance for emphasis and evidence for maximum claim strength", async () => {
      await generateCoverLetterDraft(input, "en");

      const prompt = lastPrompt();
      expect(prompt).toContain(
        "Relevance determines whether a capability may be emphasized.",
      );
      expect(prompt).toContain(
        "Evidence determines the maximum strength of the claim.",
      );
      expect(prompt).toContain(
        "The Master CV is the only candidate evidence and the sole source of truth for candidate capabilities.",
      );
      expect(prompt).toContain(
        "If a capability has no evidence and no meaningful relevance, do not mention it.",
      );
    });

    it("does not treat professionalWeight, priority, or jobRelevance as expertise, seniority, or proficiency", async () => {
      await generateCoverLetterDraft(input, "en");

      const prompt = lastPrompt();
      expect(prompt).toContain(
        "professionalWeight, priority, and jobRelevance must never imply expertise, seniority, or proficiency.",
      );
      expect(prompt).toContain("Do not turn relevance into expertise.");
      expect(prompt).toContain(
        "Do not turn professional weight into seniority.",
      );
      expect(prompt).toContain("Do not turn priority into proficiency.");
      expect(prompt).toContain("Relevance does not imply expertise.");
      expect(prompt).toContain("professionalWeight does not imply seniority.");
      expect(prompt).toContain("Priority does not imply proficiency.");
    });

    it("treats Job Analysis and Profile Match as context, never as candidate evidence", async () => {
      await generateCoverLetterDraft(input, "en");

      const prompt = lastPrompt();
      expect(prompt).toContain(
        "Job Analysis and Profile Match are relevance and context signals only. They are never candidate evidence.",
      );
      expect(prompt).toContain(
        "Job Analysis requiredSkills, atsKeywords, and Profile Match matchingSkills and missingSkills must never become candidate skills or experience.",
      );
      expect(prompt).toContain(
        "Do not turn Profile Match matchingSkills or missingSkills into candidate evidence.",
      );
      expect(prompt).toContain(
        "Job Analysis experienceLevel must never become candidate seniority.",
      );
    });

    it("requires language proficiency to remain faithful to the Master CV", async () => {
      await generateCoverLetterDraft(input, "en");

      const prompt = lastPrompt();
      expect(prompt).toContain(
        "If a language is mentioned, its proficiency must remain faithful to the Master CV.",
      );
      expect(prompt).toContain("Do not upgrade language proficiency.");
      expect(prompt).toContain(
        "Do not change English — Intermediate into Conversational English, fluent English, advanced English, or any other upgraded formulation.",
      );
    });

    it("allows a relevant unsupported capability as interest or development, never as demonstrated experience", async () => {
      await generateCoverLetterDraft(input, "en");

      const prompt = lastPrompt();
      expect(prompt).toContain(
        "If a capability is relevant to the job but lacks sufficient Master CV evidence, it may be framed as interest or development but must not be presented as demonstrated experience.",
      );
      expect(prompt).toContain("demonstrated professional experience");
      expect(prompt).toContain("project experience");
      expect(prompt).toContain("documented knowledge or education");
      expect(prompt).toContain("interest or development area");
      expect(prompt).toContain(
        "Claim strength is conceptual guidance only and is not a Skill Profile field.",
      );
    });

    it("does not let evidence authorize a stronger claim than it supports", async () => {
      await generateCoverLetterDraft(input, "en");

      const prompt = lastPrompt();
      expect(prompt).toContain(
        "Do not use evidence to justify a stronger claim than the evidence supports.",
      );
      expect(prompt).toContain(
        "Built interfaces using React may support experience with React, but not expert in React.",
      );
      expect(prompt).toContain("Evidence does not authorize stronger claims.");
    });
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
