import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MasterCvInput } from "../types/master-cv.js";
import {
  SKILL_PROFILE_CONTRACT_VERSION,
  type SkillIntelligenceInput,
  type SkillProfile,
} from "../types/skill-intelligence.js";
import { SkillIntelligenceError } from "./skill-intelligence.js";

const { generateSkillProfile } = vi.hoisted(() => ({
  generateSkillProfile: vi.fn(),
}));

vi.mock("./skill-intelligence-ai.service.js", () => ({
  generateSkillProfile,
}));

import {
  buildSkillProfileCacheIdentity,
  clearSkillProfileCache,
  getOrComputeSkillProfile,
  skillProfileCacheKey,
} from "./skill-intelligence-cache.js";

function masterCv(overrides: Partial<MasterCvInput> = {}): MasterCvInput {
  return {
    fullName: "Taylor Smith",
    professionalTitle: "Software Engineer",
    email: "taylor@example.com",
    phone: "+1 555 0100",
    location: "Berlin",
    linkedin: "https://linkedin.com/in/taylor",
    website: "https://example.com",
    professionalSummary: "Software engineer",
    experience: [
      {
        jobTitle: "Software Engineer",
        company: "Example",
        location: "Berlin",
        startDate: "2020-01",
        endDate: null,
        current: true,
        description: "Developed interfaces using React.",
      },
    ],
    education: [
      {
        institution: "Example University",
        degree: "BSc",
        fieldOfStudy: "Computer Science",
        startDate: null,
        endDate: null,
        description: null,
      },
    ],
    skills: ["React", "TypeScript"],
    languages: [{ name: "English", proficiency: "Native" }],
    certifications: [
      { name: "AWS", issuer: "Amazon", issueDate: null, credentialUrl: null },
    ],
    personalProjects: [
      {
        name: "Career Copilot",
        description: "LLM Integration and Prompt Engineering",
        technologies: "TypeScript",
        url: "https://example.com/career-copilot",
      },
    ],
    ...overrides,
  };
}

function skillIntelligenceInput(
  overrides: Partial<SkillIntelligenceInput> = {},
): SkillIntelligenceInput {
  return {
    masterCv: masterCv(),
    jobAnalysis: {
      requiredSkills: ["React", "TypeScript"],
      atsKeywords: ["React"],
      responsibilities: ["Build interfaces"],
      summary: "Frontend engineer for product teams.",
    },
    profileMatch: {
      matchingSkills: ["React"],
      missingSkills: ["REST APIs"],
      strengths: ["Strong React experience for the role."],
      weaknesses: ["REST APIs are not demonstrated."],
      alignmentScore: 74,
      alignmentReasoning: "Core frontend skills are supported.",
      recommendation: "Continue after strengthening API evidence.",
    },
    ...overrides,
  };
}

const profile: SkillProfile = {
  skills: [
    {
      sourceSkill: "React",
      canonicalSkill: "React",
      category: "Front-End",
      professionalWeight: "core_professional",
      jobRelevance: "very_high",
      priority: 1,
      evidence: [{ source: "experience", reference: "experience[0]" }],
    },
    {
      sourceSkill: "TypeScript",
      canonicalSkill: "TypeScript",
      category: "Front-End",
      professionalWeight: "core_professional",
      jobRelevance: "high",
      priority: 2,
      evidence: [],
    },
  ],
};

const recomputedProfile: SkillProfile = {
  skills: profile.skills.map((item) => ({
    ...item,
    category: "Updated",
  })),
};

beforeEach(() => {
  clearSkillProfileCache();
  generateSkillProfile.mockReset();
  generateSkillProfile.mockImplementation(async () => structuredClone(profile));
});

describe("buildSkillProfileCacheIdentity", () => {
  it("includes userId, applicationId, source fingerprint, and contract version", () => {
    const identity = buildSkillProfileCacheIdentity(
      "user-1",
      "application-1",
      skillIntelligenceInput(),
    );

    expect(identity).toEqual({
      userId: "user-1",
      applicationId: "application-1",
      sourceFingerprint: identity.sourceFingerprint,
      skillProfileContractVersion: SKILL_PROFILE_CONTRACT_VERSION,
    });
    expect(identity.sourceFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(skillProfileCacheKey(identity)).toBe(
      JSON.stringify([
        "user-1",
        "application-1",
        identity.sourceFingerprint,
        SKILL_PROFILE_CONTRACT_VERSION,
      ]),
    );
  });
});

describe("getOrComputeSkillProfile", () => {
  it("computes on a cache miss using the Phase 2 AI service", async () => {
    const input = skillIntelligenceInput();

    await expect(
      getOrComputeSkillProfile({
        userId: "user-1",
        applicationId: "application-1",
        input,
      }),
    ).resolves.toEqual(profile);

    expect(generateSkillProfile).toHaveBeenCalledOnce();
    expect(generateSkillProfile).toHaveBeenCalledWith(input);
  });

  it("returns the cached Skill Profile on a hit without calling the AI again", async () => {
    const params = {
      userId: "user-1",
      applicationId: "application-1",
      input: skillIntelligenceInput(),
    };

    const first = await getOrComputeSkillProfile(params);
    first.skills[0].category = "Mutated";
    generateSkillProfile.mockImplementation(async () =>
      structuredClone(recomputedProfile),
    );
    const second = await getOrComputeSkillProfile(params);

    expect(generateSkillProfile).toHaveBeenCalledOnce();
    expect(second).toEqual(profile);
    expect(second).not.toBe(first);
    expect(second.skills[0].category).toBe("Front-End");
  });

  it("does not reuse a Skill Profile across users or applications", async () => {
    const input = skillIntelligenceInput();
    generateSkillProfile
      .mockResolvedValueOnce(structuredClone(profile))
      .mockResolvedValueOnce(structuredClone(recomputedProfile))
      .mockResolvedValueOnce({
        skills: recomputedProfile.skills.map((item) => ({
          ...item,
          category: "Other application",
        })),
      });

    const forUser = await getOrComputeSkillProfile({
      userId: "user-1",
      applicationId: "application-1",
      input,
    });
    const forOtherUser = await getOrComputeSkillProfile({
      userId: "user-2",
      applicationId: "application-1",
      input,
    });
    const forOtherApplication = await getOrComputeSkillProfile({
      userId: "user-1",
      applicationId: "application-2",
      input,
    });

    expect(generateSkillProfile).toHaveBeenCalledTimes(3);
    expect(forUser).toEqual(profile);
    expect(forOtherUser).toEqual(recomputedProfile);
    expect(forOtherApplication.skills[0]?.category).toBe("Other application");
  });

  it("recomputes when a fingerprint input changes", async () => {
    await getOrComputeSkillProfile({
      userId: "user-1",
      applicationId: "application-1",
      input: skillIntelligenceInput(),
    });
    generateSkillProfile.mockImplementation(async () =>
      structuredClone(recomputedProfile),
    );

    const recomputed = await getOrComputeSkillProfile({
      userId: "user-1",
      applicationId: "application-1",
      input: skillIntelligenceInput({
        masterCv: masterCv({
          professionalSummary: "Updated professional summary",
        }),
      }),
    });

    expect(generateSkillProfile).toHaveBeenCalledTimes(2);
    expect(recomputed).toEqual(recomputedProfile);
  });

  it("does not invalidate when excluded personal or document fields change", async () => {
    const input = skillIntelligenceInput();
    await getOrComputeSkillProfile({
      userId: "user-1",
      applicationId: "application-1",
      input,
    });

    await expect(
      getOrComputeSkillProfile({
        userId: "user-1",
        applicationId: "application-1",
        input: {
          ...input,
          masterCv: {
            ...input.masterCv,
            email: "other@example.com",
            phone: "+1 555 0199",
            location: "Paris",
            linkedin: "https://linkedin.com/in/other",
            website: "https://other.example.com",
            experience: input.masterCv.experience.map((item) => ({
              ...item,
              location: "Paris",
              startDate: "2019-01",
            })),
          },
        },
      }),
    ).resolves.toEqual(profile);

    expect(generateSkillProfile).toHaveBeenCalledOnce();
  });

  it("does not cache a failed computation or invent a fallback Skill Profile", async () => {
    const params = {
      userId: "user-1",
      applicationId: "application-1",
      input: skillIntelligenceInput(),
    };
    const failure = new SkillIntelligenceError(
      "Invalid Skill Intelligence response.",
      502,
    );
    generateSkillProfile.mockRejectedValueOnce(failure);

    await expect(getOrComputeSkillProfile(params)).rejects.toBe(failure);
    expect(generateSkillProfile).toHaveBeenCalledOnce();

    generateSkillProfile.mockImplementation(async () =>
      structuredClone(profile),
    );

    await expect(getOrComputeSkillProfile(params)).resolves.toEqual(profile);
    expect(generateSkillProfile).toHaveBeenCalledTimes(2);
  });

  it("does not automatically retry the AI call within a failed request", async () => {
    generateSkillProfile.mockRejectedValue(
      new SkillIntelligenceError("Invalid Skill Intelligence response.", 502),
    );

    await expect(
      getOrComputeSkillProfile({
        userId: "user-1",
        applicationId: "application-1",
        input: skillIntelligenceInput(),
      }),
    ).rejects.toMatchObject({
      message: "Invalid Skill Intelligence response.",
      statusCode: 502,
    });

    expect(generateSkillProfile).toHaveBeenCalledOnce();
  });

  it("recomputes after the process cache is cleared", async () => {
    const params = {
      userId: "user-1",
      applicationId: "application-1",
      input: skillIntelligenceInput(),
    };

    await getOrComputeSkillProfile(params);
    clearSkillProfileCache();
    generateSkillProfile.mockImplementation(async () =>
      structuredClone(recomputedProfile),
    );

    await expect(getOrComputeSkillProfile(params)).resolves.toEqual(
      recomputedProfile,
    );
    expect(generateSkillProfile).toHaveBeenCalledTimes(2);
  });
});
