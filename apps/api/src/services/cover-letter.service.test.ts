import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/cover-letter.repository.js", () => ({
  findCoverLetterByApplicationId: vi.fn(),
  upsertCoverLetter: vi.fn(),
}));

vi.mock("./application.service.js", () => ({
  ApplicationError: class ApplicationError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  getOwnedApplication: vi.fn(),
}));

vi.mock("./cover-letter-ai.service.js", () => ({
  generateCoverLetterDraft: vi.fn(),
}));

vi.mock("./skill-intelligence-cache.js", () => ({
  getOrComputeSkillProfile: vi.fn(),
}));

vi.mock("./optimized-cv.service.js", () => ({
  OptimizedCvError: class OptimizedCvError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  getOptimizedCv: vi.fn(),
}));

vi.mock("./profile-comparison.service.js", () => ({
  ProfileComparisonError: class ProfileComparisonError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  prepareProfileComparisonInput: vi.fn(),
  getProfileComparison: vi.fn(),
}));

import {
  findCoverLetterByApplicationId,
  upsertCoverLetter,
} from "../repositories/cover-letter.repository.js";
import {
  ApplicationError,
  getOwnedApplication,
} from "./application.service.js";
import { generateCoverLetterDraft } from "./cover-letter-ai.service.js";
import {
  CoverLetterError,
  generateCoverLetter,
  getCoverLetter,
  saveCoverLetter,
} from "./cover-letter.service.js";
import { getOptimizedCv, OptimizedCvError } from "./optimized-cv.service.js";
import {
  getProfileComparison,
  prepareProfileComparisonInput,
  ProfileComparisonError,
} from "./profile-comparison.service.js";
import { getOrComputeSkillProfile } from "./skill-intelligence-cache.js";
import { SkillIntelligenceError } from "./skill-intelligence.js";

const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const userId = "4e9c843b-5c3d-4e65-8514-7de898b2aca6";

const masterCv = {
  fullName: "Taylor Smith",
  professionalTitle: null,
  email: "taylor@example.com",
  phone: "+1 555 0100",
  location: "Berlin",
  linkedin: null,
  website: null,
  professionalSummary: "Software engineer",
  experience: [
    {
      jobTitle: "Software Engineer",
      company: "Example",
      location: null,
      startDate: null,
      endDate: null,
      current: true,
      description: "Built APIs",
    },
  ],
  education: [],
  skills: ["TypeScript"],
  languages: [],
  certifications: [],
};

const jobAnalysis = {
  title: "Software Engineer",
  company: "Acme",
  employmentType: "Full-time",
  location: "Remote",
  experienceLevel: "Mid-level",
  education: null,
  languages: [],
  summary: "Build web products.",
  requiredSkills: ["TypeScript"],
  responsibilities: ["Build APIs"],
  atsKeywords: ["TypeScript"],
};

const profileMatch = {
  matchingSkills: ["TypeScript"],
  missingSkills: [],
  strengths: ["TypeScript experience supports the role."],
  weaknesses: [],
  alignmentScore: 80,
  alignmentReasoning: "Core skills are supported.",
  recommendation: "Strong opportunity. Continue with the application.",
  workingLanguage: "es" as const,
};

const skillProfile = {
  skills: [
    {
      sourceSkill: "TypeScript",
      canonicalSkill: "TS",
      category: "Front-End",
      professionalWeight: "core_professional" as const,
      jobRelevance: "very_high" as const,
      priority: 1,
      evidence: [{ source: "experience" as const, reference: "experience[0]" }],
    },
  ],
};

const optimizedCv = {
  ...masterCv,
  professionalSummary: "TypeScript engineer building APIs.",
  workingLanguage: null,
};

const coverLetter = {
  candidateName: "Taylor Smith",
  email: "taylor@example.com",
  phone: "+1 555 0100",
  date: "August 7, 2026",
  companyName: "Acme",
  greeting: "Dear Hiring Manager,",
  introduction: "I am writing to apply for the Software Engineer role at Acme.",
  professionalValue:
    "My experience building TypeScript APIs aligns with your requirements.",
  motivation:
    "I am interested in contributing to Acme's product engineering team.",
  closing: "Thank you for your consideration. I am available for an interview.",
  signature: "Taylor Smith",
};

const persistedCoverLetter = {
  id: "cover-letter-id",
  applicationId,
  ...coverLetter,
  createdAt: new Date("2026-08-07T12:00:00.000Z"),
  updatedAt: new Date("2026-08-07T12:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOwnedApplication).mockResolvedValue({
    id: applicationId,
  } as never);
  vi.mocked(findCoverLetterByApplicationId).mockResolvedValue(null);
  vi.mocked(upsertCoverLetter).mockResolvedValue(persistedCoverLetter as never);
  vi.mocked(prepareProfileComparisonInput).mockResolvedValue({
    masterCv,
    jobAnalysis,
  });
  vi.mocked(getOptimizedCv).mockResolvedValue(optimizedCv);
  vi.mocked(getProfileComparison).mockResolvedValue(profileMatch);
  vi.mocked(getOrComputeSkillProfile).mockResolvedValue(skillProfile);
  vi.mocked(generateCoverLetterDraft).mockResolvedValue({
    ...coverLetter,
    workingLanguage: "en",
  });
});

describe("generateCoverLetter", () => {
  it("generates a Cover Letter from Master CV, Job Analysis, saved Profile Match, saved Optimized CV, and Skill Profile", async () => {
    await expect(
      generateCoverLetter(applicationId, userId, "en"),
    ).resolves.toEqual({
      ...coverLetter,
      workingLanguage: "en",
    });

    expect(prepareProfileComparisonInput).toHaveBeenCalledWith(
      applicationId,
      userId,
    );
    expect(getOptimizedCv).toHaveBeenCalledWith(applicationId, userId);
    expect(getProfileComparison).toHaveBeenCalledWith(applicationId, userId);
    expect(getOrComputeSkillProfile).toHaveBeenCalledWith({
      userId,
      applicationId,
      input: {
        masterCv,
        jobAnalysis,
        profileMatch,
      },
    });
    expect(
      vi.mocked(getOrComputeSkillProfile).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(generateCoverLetterDraft).mock.invocationCallOrder[0]!,
    );
    expect(generateCoverLetterDraft).toHaveBeenCalledWith(
      {
        masterCv,
        jobAnalysis,
        profileMatch,
        optimizedCv,
        skillProfile,
      },
      "en",
    );
  });

  it("passes the persisted Profile Match from getProfileComparison, including workingLanguage", async () => {
    const persistedProfileMatch = {
      ...profileMatch,
      workingLanguage: "es" as const,
    };
    vi.mocked(getProfileComparison).mockResolvedValue(persistedProfileMatch);

    await generateCoverLetter(applicationId, userId, "fr");

    expect(getProfileComparison).toHaveBeenCalledWith(applicationId, userId);
    expect(getOrComputeSkillProfile).toHaveBeenCalledWith({
      userId,
      applicationId,
      input: {
        masterCv,
        jobAnalysis,
        profileMatch: persistedProfileMatch,
      },
    });
    expect(generateCoverLetterDraft).toHaveBeenCalledWith(
      {
        masterCv,
        jobAnalysis,
        profileMatch: persistedProfileMatch,
        optimizedCv,
        skillProfile,
      },
      "fr",
    );
  });

  it("returns an error when no saved Optimized CV exists", async () => {
    vi.mocked(getOptimizedCv).mockRejectedValue(
      new OptimizedCvError("Optimized CV not found.", 404),
    );

    await expect(
      generateCoverLetter(applicationId, userId, "en"),
    ).rejects.toEqual(new CoverLetterError("Optimized CV not found.", 404));
    expect(getProfileComparison).not.toHaveBeenCalled();
    expect(getOrComputeSkillProfile).not.toHaveBeenCalled();
    expect(generateCoverLetterDraft).not.toHaveBeenCalled();
  });

  it("returns an error when no saved Profile Match exists", async () => {
    vi.mocked(getProfileComparison).mockRejectedValue(
      new ProfileComparisonError("Profile Match not found.", 404),
    );

    await expect(
      generateCoverLetter(applicationId, userId, "en"),
    ).rejects.toEqual(new CoverLetterError("Profile Match not found.", 404));
    expect(getOrComputeSkillProfile).not.toHaveBeenCalled();
    expect(generateCoverLetterDraft).not.toHaveBeenCalled();
  });

  it("maps missing Job Analysis errors to CoverLetterError", async () => {
    vi.mocked(prepareProfileComparisonInput).mockRejectedValue(
      new ProfileComparisonError("Job analysis not found.", 404),
    );

    await expect(
      generateCoverLetter(applicationId, userId, "en"),
    ).rejects.toEqual(new CoverLetterError("Job analysis not found.", 404));
    expect(getOptimizedCv).not.toHaveBeenCalled();
    expect(getProfileComparison).not.toHaveBeenCalled();
    expect(getOrComputeSkillProfile).not.toHaveBeenCalled();
    expect(generateCoverLetterDraft).not.toHaveBeenCalled();
  });

  it("fails closed when Skill Intelligence fails and does not generate a draft", async () => {
    vi.mocked(getOrComputeSkillProfile).mockRejectedValue(
      new SkillIntelligenceError("Invalid Skill Intelligence response.", 502),
    );

    await expect(
      generateCoverLetter(applicationId, userId, "en"),
    ).rejects.toEqual(
      new CoverLetterError("Invalid Skill Intelligence response.", 502),
    );
    expect(getOrComputeSkillProfile).toHaveBeenCalledWith({
      userId,
      applicationId,
      input: {
        masterCv,
        jobAnalysis,
        profileMatch,
      },
    });
    expect(generateCoverLetterDraft).not.toHaveBeenCalled();
  });
});

describe("getCoverLetter", () => {
  it("returns the saved Cover Letter for an owned application", async () => {
    vi.mocked(findCoverLetterByApplicationId).mockResolvedValue(
      persistedCoverLetter as never,
    );

    await expect(getCoverLetter(applicationId, userId)).resolves.toEqual({
      ...coverLetter,
      workingLanguage: null,
    });
    expect(getOwnedApplication).toHaveBeenCalledWith(applicationId, userId);
    expect(findCoverLetterByApplicationId).toHaveBeenCalledWith(applicationId);
  });

  it.each(["es", "en", "fr"] as const)(
    "returns stored Working Language %s without substituting another locale",
    async (workingLanguage) => {
      vi.mocked(findCoverLetterByApplicationId).mockResolvedValue({
        ...persistedCoverLetter,
        workingLanguage,
      } as never);

      await expect(getCoverLetter(applicationId, userId)).resolves.toEqual({
        ...coverLetter,
        workingLanguage,
      });
    },
  );

  it("returns 404 when no saved Cover Letter exists", async () => {
    await expect(getCoverLetter(applicationId, userId)).rejects.toEqual(
      new CoverLetterError("Cover Letter not found.", 404),
    );
  });

  it("maps missing application ownership to CoverLetterError", async () => {
    vi.mocked(getOwnedApplication).mockRejectedValue(
      new ApplicationError("Application not found.", 404),
    );

    await expect(getCoverLetter(applicationId, userId)).rejects.toEqual(
      new CoverLetterError("Application not found.", 404),
    );
    expect(findCoverLetterByApplicationId).not.toHaveBeenCalled();
  });
});

describe("saveCoverLetter", () => {
  it("upserts the Cover Letter for an owned application", async () => {
    vi.mocked(upsertCoverLetter).mockResolvedValue({
      ...persistedCoverLetter,
      workingLanguage: "en",
    } as never);

    await expect(
      saveCoverLetter(applicationId, userId, {
        ...coverLetter,
        workingLanguage: "en",
      }),
    ).resolves.toEqual({
      ...coverLetter,
      workingLanguage: "en",
    });

    expect(getOwnedApplication).toHaveBeenCalledWith(applicationId, userId);
    expect(upsertCoverLetter).toHaveBeenCalledWith(applicationId, {
      ...coverLetter,
      workingLanguage: "en",
    });
  });

  it.each(["es", "en", "fr"] as const)(
    "persists Working Language %s for a newly saved Cover Letter",
    async (workingLanguage) => {
      vi.mocked(upsertCoverLetter).mockResolvedValue({
        ...persistedCoverLetter,
        workingLanguage,
      } as never);

      await expect(
        saveCoverLetter(applicationId, userId, {
          ...coverLetter,
          workingLanguage,
        }),
      ).resolves.toEqual({
        ...coverLetter,
        workingLanguage,
      });
      expect(upsertCoverLetter).toHaveBeenCalledWith(applicationId, {
        ...coverLetter,
        workingLanguage,
      });
    },
  );

  it("rejects a first save without Working Language", async () => {
    await expect(
      saveCoverLetter(applicationId, userId, coverLetter),
    ).rejects.toEqual(
      new CoverLetterError(
        'workingLanguage must be one of "es", "en", or "fr".',
        400,
      ),
    );
    expect(upsertCoverLetter).not.toHaveBeenCalled();
  });

  it("rejects an unsupported Working Language before persistence", async () => {
    await expect(
      saveCoverLetter(applicationId, userId, {
        ...coverLetter,
        workingLanguage: "de",
      }),
    ).rejects.toEqual(
      new CoverLetterError(
        'workingLanguage must be one of "es", "en", or "fr".',
        400,
      ),
    );
    expect(upsertCoverLetter).not.toHaveBeenCalled();
    expect(findCoverLetterByApplicationId).not.toHaveBeenCalled();
  });

  it("returns null Working Language for a legacy row without substituting a locale", async () => {
    vi.mocked(findCoverLetterByApplicationId).mockResolvedValue(
      persistedCoverLetter as never,
    );

    await expect(getCoverLetter(applicationId, userId)).resolves.toEqual({
      ...coverLetter,
      workingLanguage: null,
    });
    expect(upsertCoverLetter).not.toHaveBeenCalled();
  });

  it("preserves null Working Language when saving unchanged legacy text", async () => {
    vi.mocked(findCoverLetterByApplicationId).mockResolvedValue(
      persistedCoverLetter as never,
    );
    vi.mocked(upsertCoverLetter).mockResolvedValue({
      ...persistedCoverLetter,
      workingLanguage: null,
    } as never);

    await expect(
      saveCoverLetter(applicationId, userId, {
        ...coverLetter,
        workingLanguage: null,
      }),
    ).resolves.toEqual({
      ...coverLetter,
      workingLanguage: null,
    });
    expect(upsertCoverLetter).toHaveBeenCalledWith(applicationId, {
      ...coverLetter,
      workingLanguage: null,
    });
  });

  it("replaces Working Language only when a newly generated draft is saved", async () => {
    vi.mocked(findCoverLetterByApplicationId).mockResolvedValue({
      ...persistedCoverLetter,
      workingLanguage: "en",
    } as never);
    vi.mocked(upsertCoverLetter).mockResolvedValue({
      ...persistedCoverLetter,
      workingLanguage: "es",
    } as never);

    await expect(
      saveCoverLetter(applicationId, userId, {
        ...coverLetter,
        workingLanguage: "es",
      }),
    ).resolves.toEqual({
      ...coverLetter,
      workingLanguage: "es",
    });
    expect(upsertCoverLetter).toHaveBeenCalledWith(applicationId, {
      ...coverLetter,
      workingLanguage: "es",
    });
  });

  it("rejects invalid Cover Letter payloads", async () => {
    await expect(saveCoverLetter(applicationId, userId, {})).rejects.toEqual(
      new CoverLetterError("candidateName is required.", 400),
    );
    expect(upsertCoverLetter).not.toHaveBeenCalled();
  });

  it("rejects invalid email, phone, and date values", async () => {
    await expect(
      saveCoverLetter(applicationId, userId, {
        ...coverLetter,
        email: "not-an-email",
      }),
    ).rejects.toEqual(
      new CoverLetterError("email must be a valid email address.", 400),
    );
    await expect(
      saveCoverLetter(applicationId, userId, {
        ...coverLetter,
        phone: "hello",
      }),
    ).rejects.toEqual(
      new CoverLetterError("phone must be a valid phone number.", 400),
    );
    await expect(
      saveCoverLetter(applicationId, userId, {
        ...coverLetter,
        date: "tomorrow",
      }),
    ).rejects.toEqual(new CoverLetterError("date must be a valid date.", 400));
    expect(upsertCoverLetter).not.toHaveBeenCalled();
  });

  it("allows empty editable letter body fields", async () => {
    const cleared = {
      ...coverLetter,
      greeting: "",
      introduction: "",
      professionalValue: "",
      motivation: "",
      closing: "",
      workingLanguage: "en" as const,
    };
    vi.mocked(upsertCoverLetter).mockResolvedValue({
      ...persistedCoverLetter,
      ...cleared,
    } as never);

    await expect(
      saveCoverLetter(applicationId, userId, cleared),
    ).resolves.toEqual(cleared);
    expect(upsertCoverLetter).toHaveBeenCalledWith(applicationId, cleared);
  });

  it("maps missing application ownership to CoverLetterError", async () => {
    vi.mocked(getOwnedApplication).mockRejectedValue(
      new ApplicationError("Application not found.", 404),
    );

    await expect(
      saveCoverLetter(applicationId, userId, coverLetter),
    ).rejects.toEqual(new CoverLetterError("Application not found.", 404));
    expect(upsertCoverLetter).not.toHaveBeenCalled();
  });
});
