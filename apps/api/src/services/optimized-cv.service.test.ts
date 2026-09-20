import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./optimized-cv-ai.service.js", () => ({
  generateOptimizedCvDraft: vi.fn(),
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

vi.mock("./master-cv.service.js", () => ({
  MasterCvError: class MasterCvError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  validateMasterCvInput: vi.fn(),
}));

vi.mock("../repositories/optimized-cv.repository.js", () => ({
  findOptimizedCvByApplicationId: vi.fn(),
  upsertOptimizedCv: vi.fn(),
}));

vi.mock("../repositories/master-cv.repository.js", () => ({
  findMasterCvByUserId: vi.fn(),
}));

vi.mock("./master-cv-photo.service.js", () => ({
  ProfilePhotoError: class ProfilePhotoError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  snapshotMasterCvPhoto: vi.fn(),
  resolveOptimizedCvPhotoObjectKey: vi.fn(),
  getOptimizedCvPhoto: vi.fn(),
}));

vi.mock("./profile-photo-storage.service.js", () => ({
  deleteUnreferencedProfilePhotoObjects: vi.fn(),
}));

vi.mock("./skill-intelligence-cache.js", () => ({
  getOrComputeSkillProfile: vi.fn(),
}));

import { findMasterCvByUserId } from "../repositories/master-cv.repository.js";
import {
  findOptimizedCvByApplicationId,
  upsertOptimizedCv,
} from "../repositories/optimized-cv.repository.js";
import {
  ApplicationError,
  getOwnedApplication,
} from "./application.service.js";
import { MasterCvError, validateMasterCvInput } from "./master-cv.service.js";
import {
  resolveOptimizedCvPhotoObjectKey,
  snapshotMasterCvPhoto,
} from "./master-cv-photo.service.js";
import { generateOptimizedCvDraft } from "./optimized-cv-ai.service.js";
import {
  generateOptimizedCv,
  getOptimizedCv,
  OptimizedCvError,
  saveOptimizedCv,
} from "./optimized-cv.service.js";
import { deleteUnreferencedProfilePhotoObjects } from "./profile-photo-storage.service.js";
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
  phone: null,
  location: null,
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
      canonicalSkill: "TypeScript",
      category: "Front-End",
      professionalWeight: "core_professional" as const,
      jobRelevance: "very_high" as const,
      priority: 1,
      evidence: [],
    },
  ],
};

const optimizedCv = {
  ...masterCv,
  professionalSummary: "TypeScript engineer building APIs.",
  profilePhotoAssetId: null,
  profilePhotoPositionX: null,
  profilePhotoPositionY: null,
};

const persistedOptimizedCv = {
  id: "optimized-cv-id",
  applicationId,
  ...optimizedCv,
  createdAt: new Date("2026-08-03T10:00:00.000Z"),
  updatedAt: new Date("2026-08-03T10:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prepareProfileComparisonInput).mockResolvedValue({
    masterCv,
    jobAnalysis,
  });
  vi.mocked(getProfileComparison).mockResolvedValue(profileMatch);
  vi.mocked(getOrComputeSkillProfile).mockResolvedValue(skillProfile);
  vi.mocked(generateOptimizedCvDraft).mockResolvedValue({
    ...optimizedCv,
    workingLanguage: "fr",
  });
  vi.mocked(findMasterCvByUserId).mockResolvedValue({
    ...masterCv,
    profilePhotoObjectKey: null,
  } as never);
  vi.mocked(snapshotMasterCvPhoto).mockResolvedValue(null);
  vi.mocked(resolveOptimizedCvPhotoObjectKey).mockResolvedValue(null);
  vi.mocked(deleteUnreferencedProfilePhotoObjects).mockResolvedValue();
  vi.mocked(getOwnedApplication).mockResolvedValue({
    id: applicationId,
  } as never);
  vi.mocked(findOptimizedCvByApplicationId).mockResolvedValue(null);
  vi.mocked(upsertOptimizedCv).mockResolvedValue(persistedOptimizedCv as never);
  vi.mocked(validateMasterCvInput).mockImplementation((value) => {
    if (!value || typeof value !== "object" || !("fullName" in value)) {
      throw new MasterCvError("fullName is required.", 400);
    }
    const input = value as typeof optimizedCv;
    return {
      fullName: input.fullName,
      professionalTitle: input.professionalTitle,
      email: input.email,
      phone: input.phone,
      location: input.location,
      linkedin: input.linkedin,
      website: input.website,
      professionalSummary: input.professionalSummary,
      experience: input.experience,
      education: input.education,
      skills: input.skills,
      languages: input.languages,
      certifications: input.certifications,
    };
  });
});

describe("generateOptimizedCv", () => {
  it("generates an Optimized CV from Master CV, Job Analysis, and saved Profile Match", async () => {
    await expect(
      generateOptimizedCv(applicationId, userId, "fr"),
    ).resolves.toEqual({
      ...optimizedCv,
      workingLanguage: "fr",
    });

    expect(prepareProfileComparisonInput).toHaveBeenCalledWith(
      applicationId,
      userId,
    );
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
      vi.mocked(generateOptimizedCvDraft).mock.invocationCallOrder[0]!,
    );
    expect(generateOptimizedCvDraft).toHaveBeenCalledWith(
      {
        masterCv,
        jobAnalysis,
        profileMatch,
        skillProfile,
      },
      "fr",
      null,
      null,
      null,
    );
  });

  it("passes the persisted Profile Match from getProfileComparison, including workingLanguage", async () => {
    const persistedProfileMatch = {
      ...profileMatch,
      workingLanguage: "es" as const,
    };
    vi.mocked(getProfileComparison).mockResolvedValue(persistedProfileMatch);

    await generateOptimizedCv(applicationId, userId, "fr");

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
    expect(generateOptimizedCvDraft).toHaveBeenCalledWith(
      {
        masterCv,
        jobAnalysis,
        profileMatch: persistedProfileMatch,
        skillProfile,
      },
      "fr",
      null,
      null,
      null,
    );
  });

  it("snapshots the Master CV photo to a new application key", async () => {
    const snapshotKey = `users/${userId}/applications/${applicationId}/optimized-cv/profile-photo/7e9c843b-5c3d-4e65-8514-7de898b2aca6`;
    vi.mocked(findMasterCvByUserId).mockResolvedValue({
      ...masterCv,
      profilePhotoObjectKey: `users/${userId}/master-cv/profile-photo/11111111-1111-4111-8111-111111111111`,
      profilePhotoPositionX: 25,
      profilePhotoPositionY: 75,
    } as never);
    vi.mocked(snapshotMasterCvPhoto).mockResolvedValue(snapshotKey);
    vi.mocked(generateOptimizedCvDraft).mockResolvedValue({
      ...optimizedCv,
      profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
      profilePhotoPositionX: 25,
      profilePhotoPositionY: 75,
      workingLanguage: "fr",
    });

    await expect(
      generateOptimizedCv(applicationId, userId, "fr"),
    ).resolves.toEqual({
      ...optimizedCv,
      profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
      profilePhotoPositionX: 25,
      profilePhotoPositionY: 75,
      workingLanguage: "fr",
    });
    expect(snapshotMasterCvPhoto).toHaveBeenCalledWith(
      userId,
      applicationId,
      `users/${userId}/master-cv/profile-photo/11111111-1111-4111-8111-111111111111`,
      null,
    );
    expect(generateOptimizedCvDraft).toHaveBeenCalledWith(
      expect.anything(),
      "fr",
      "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
      25,
      75,
    );
  });

  it("maps missing Job Analysis errors to OptimizedCvError", async () => {
    vi.mocked(prepareProfileComparisonInput).mockRejectedValue(
      new ProfileComparisonError("Job analysis not found.", 404),
    );

    await expect(
      generateOptimizedCv(applicationId, userId, "fr"),
    ).rejects.toEqual(new OptimizedCvError("Job analysis not found.", 404));
    expect(getProfileComparison).not.toHaveBeenCalled();
    expect(getOrComputeSkillProfile).not.toHaveBeenCalled();
    expect(generateOptimizedCvDraft).not.toHaveBeenCalled();
  });

  it("maps missing Profile Match errors to OptimizedCvError", async () => {
    vi.mocked(getProfileComparison).mockRejectedValue(
      new ProfileComparisonError("Profile Match not found.", 404),
    );

    await expect(
      generateOptimizedCv(applicationId, userId, "fr"),
    ).rejects.toEqual(new OptimizedCvError("Profile Match not found.", 404));
    expect(getOrComputeSkillProfile).not.toHaveBeenCalled();
    expect(generateOptimizedCvDraft).not.toHaveBeenCalled();
  });

  it("fails closed when Skill Intelligence fails and does not generate a draft", async () => {
    vi.mocked(getOrComputeSkillProfile).mockRejectedValue(
      new SkillIntelligenceError("Invalid Skill Intelligence response.", 502),
    );

    await expect(
      generateOptimizedCv(applicationId, userId, "fr"),
    ).rejects.toEqual(
      new OptimizedCvError("Invalid Skill Intelligence response.", 502),
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
    expect(generateOptimizedCvDraft).not.toHaveBeenCalled();
    expect(snapshotMasterCvPhoto).not.toHaveBeenCalled();
  });
});

describe("getOptimizedCv", () => {
  it("returns the saved Optimized CV for an owned application", async () => {
    vi.mocked(findOptimizedCvByApplicationId).mockResolvedValue(
      persistedOptimizedCv as never,
    );

    await expect(getOptimizedCv(applicationId, userId)).resolves.toEqual({
      ...optimizedCv,
      workingLanguage: null,
    });
    expect(getOwnedApplication).toHaveBeenCalledWith(applicationId, userId);
    expect(findOptimizedCvByApplicationId).toHaveBeenCalledWith(applicationId);
  });

  it.each(["es", "en", "fr"] as const)(
    "returns stored Working Language %s without substituting another locale",
    async (workingLanguage) => {
      vi.mocked(findOptimizedCvByApplicationId).mockResolvedValue({
        ...persistedOptimizedCv,
        workingLanguage,
      } as never);

      await expect(getOptimizedCv(applicationId, userId)).resolves.toEqual({
        ...optimizedCv,
        workingLanguage,
      });
    },
  );

  it("returns 404 when no saved Optimized CV exists", async () => {
    await expect(getOptimizedCv(applicationId, userId)).rejects.toEqual(
      new OptimizedCvError("Optimized CV not found.", 404),
    );
  });

  it("maps missing application ownership to OptimizedCvError", async () => {
    vi.mocked(getOwnedApplication).mockRejectedValue(
      new ApplicationError("Application not found.", 404),
    );

    await expect(getOptimizedCv(applicationId, userId)).rejects.toEqual(
      new OptimizedCvError("Application not found.", 404),
    );
    expect(findOptimizedCvByApplicationId).not.toHaveBeenCalled();
  });

  it("loads legacy string[] Optimized CV documents without Skill Intelligence", async () => {
    vi.mocked(findOptimizedCvByApplicationId).mockResolvedValue(
      persistedOptimizedCv as never,
    );

    await expect(getOptimizedCv(applicationId, userId)).resolves.toEqual({
      ...optimizedCv,
      workingLanguage: null,
    });
    expect(getOrComputeSkillProfile).not.toHaveBeenCalled();
  });

  it("loads persisted grouped skills without recomputing Skill Intelligence", async () => {
    vi.mocked(findOptimizedCvByApplicationId).mockResolvedValue({
      ...persistedOptimizedCv,
      skills: {
        groups: [{ category: "Front-End", skills: ["TypeScript"] }],
        additionalSkills: ["Excel"],
      },
    } as never);

    await expect(getOptimizedCv(applicationId, userId)).resolves.toEqual({
      ...optimizedCv,
      skills: ["TypeScript", "Excel"],
      skillGroups: [{ category: "Front-End", skills: ["TypeScript"] }],
      workingLanguage: null,
    });
    expect(getOrComputeSkillProfile).not.toHaveBeenCalled();
  });
});

describe("saveOptimizedCv", () => {
  it("upserts the Optimized CV for an owned application", async () => {
    vi.mocked(upsertOptimizedCv).mockResolvedValue({
      ...persistedOptimizedCv,
      workingLanguage: "en",
    } as never);

    await expect(
      saveOptimizedCv(applicationId, userId, {
        ...optimizedCv,
        workingLanguage: "en",
      }),
    ).resolves.toEqual({
      ...optimizedCv,
      workingLanguage: "en",
    });

    expect(getOwnedApplication).toHaveBeenCalledWith(applicationId, userId);
    expect(upsertOptimizedCv).toHaveBeenCalledWith(
      applicationId,
      expect.objectContaining({
        fullName: optimizedCv.fullName,
        email: optimizedCv.email,
      }),
      null,
      null,
      null,
      "en",
    );
    expect(snapshotMasterCvPhoto).not.toHaveBeenCalled();
  });

  it.each(["es", "en", "fr"] as const)(
    "persists Working Language %s for a newly saved Optimized CV",
    async (workingLanguage) => {
      vi.mocked(upsertOptimizedCv).mockResolvedValue({
        ...persistedOptimizedCv,
        workingLanguage,
      } as never);

      await expect(
        saveOptimizedCv(applicationId, userId, {
          ...optimizedCv,
          workingLanguage,
        }),
      ).resolves.toEqual({
        ...optimizedCv,
        workingLanguage,
      });
      expect(upsertOptimizedCv).toHaveBeenCalledWith(
        applicationId,
        expect.anything(),
        null,
        null,
        null,
        workingLanguage,
      );
    },
  );

  it("rejects a first save without Working Language", async () => {
    await expect(
      saveOptimizedCv(applicationId, userId, optimizedCv),
    ).rejects.toEqual(
      new OptimizedCvError(
        'workingLanguage must be one of "es", "en", or "fr".',
        400,
      ),
    );
    expect(upsertOptimizedCv).not.toHaveBeenCalled();
  });

  it("rejects an unsupported Working Language before persistence", async () => {
    await expect(
      saveOptimizedCv(applicationId, userId, {
        ...optimizedCv,
        workingLanguage: "de",
      }),
    ).rejects.toEqual(
      new OptimizedCvError(
        'workingLanguage must be one of "es", "en", or "fr".',
        400,
      ),
    );
    expect(upsertOptimizedCv).not.toHaveBeenCalled();
    expect(findOptimizedCvByApplicationId).not.toHaveBeenCalled();
  });

  it("returns null Working Language for a legacy row without substituting a locale", async () => {
    vi.mocked(findOptimizedCvByApplicationId).mockResolvedValue(
      persistedOptimizedCv as never,
    );

    await expect(getOptimizedCv(applicationId, userId)).resolves.toEqual({
      ...optimizedCv,
      workingLanguage: null,
    });
    expect(upsertOptimizedCv).not.toHaveBeenCalled();
  });

  it("preserves null Working Language when saving unchanged legacy text", async () => {
    vi.mocked(findOptimizedCvByApplicationId).mockResolvedValue(
      persistedOptimizedCv as never,
    );
    vi.mocked(upsertOptimizedCv).mockResolvedValue({
      ...persistedOptimizedCv,
      workingLanguage: null,
    } as never);

    await expect(
      saveOptimizedCv(applicationId, userId, {
        ...optimizedCv,
        workingLanguage: null,
      }),
    ).resolves.toEqual({
      ...optimizedCv,
      workingLanguage: null,
    });
    expect(upsertOptimizedCv).toHaveBeenCalledWith(
      applicationId,
      expect.anything(),
      null,
      null,
      null,
      null,
    );
  });

  it("replaces Working Language only when a newly generated draft is saved", async () => {
    vi.mocked(findOptimizedCvByApplicationId).mockResolvedValue({
      ...persistedOptimizedCv,
      workingLanguage: "es",
    } as never);
    vi.mocked(upsertOptimizedCv).mockResolvedValue({
      ...persistedOptimizedCv,
      workingLanguage: "fr",
    } as never);

    await expect(
      saveOptimizedCv(applicationId, userId, {
        ...optimizedCv,
        workingLanguage: "fr",
      }),
    ).resolves.toEqual({
      ...optimizedCv,
      workingLanguage: "fr",
    });
    expect(upsertOptimizedCv).toHaveBeenCalledWith(
      applicationId,
      expect.anything(),
      null,
      null,
      null,
      "fr",
    );
  });

  it("persists the generation-time asset and position without reading Master CV", async () => {
    const assetId = "7e9c843b-5c3d-4e65-8514-7de898b2aca6";
    const objectKey = `users/${userId}/applications/${applicationId}/optimized-cv/profile-photo/${assetId}`;
    const generated = {
      ...optimizedCv,
      profilePhotoAssetId: assetId,
      profilePhotoPositionX: 20,
      profilePhotoPositionY: 80,
      workingLanguage: "en" as const,
    };
    vi.mocked(resolveOptimizedCvPhotoObjectKey).mockResolvedValue(objectKey);
    vi.mocked(upsertOptimizedCv).mockResolvedValue({
      ...persistedOptimizedCv,
      profilePhotoObjectKey: objectKey,
      profilePhotoPositionX: 20,
      profilePhotoPositionY: 80,
      workingLanguage: "en",
    } as never);

    await expect(
      saveOptimizedCv(applicationId, userId, generated),
    ).resolves.toMatchObject({
      profilePhotoAssetId: assetId,
      profilePhotoPositionX: 20,
      profilePhotoPositionY: 80,
      workingLanguage: "en",
    });
    expect(upsertOptimizedCv).toHaveBeenCalledWith(
      applicationId,
      expect.anything(),
      objectKey,
      20,
      80,
      "en",
    );
    expect(findMasterCvByUserId).not.toHaveBeenCalled();
  });

  it("rejects an asset snapshot without both position values", async () => {
    await expect(
      saveOptimizedCv(applicationId, userId, {
        ...optimizedCv,
        profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
        profilePhotoPositionX: 20,
        profilePhotoPositionY: undefined,
        workingLanguage: "en",
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(upsertOptimizedCv).not.toHaveBeenCalled();
  });

  it("rejects invalid Optimized CV payloads", async () => {
    await expect(saveOptimizedCv(applicationId, userId, {})).rejects.toEqual(
      new OptimizedCvError("fullName is required.", 400),
    );
    expect(upsertOptimizedCv).not.toHaveBeenCalled();
  });

  it("maps missing application ownership to OptimizedCvError", async () => {
    vi.mocked(getOwnedApplication).mockRejectedValue(
      new ApplicationError("Application not found.", 404),
    );

    await expect(
      saveOptimizedCv(applicationId, userId, optimizedCv),
    ).rejects.toEqual(new OptimizedCvError("Application not found.", 404));
    expect(upsertOptimizedCv).not.toHaveBeenCalled();
  });

  it("does not invent categories for user-added skills", async () => {
    vi.mocked(findOptimizedCvByApplicationId).mockResolvedValue(
      persistedOptimizedCv as never,
    );
    vi.mocked(upsertOptimizedCv).mockResolvedValue({
      ...persistedOptimizedCv,
      skills: {
        groups: [{ category: "Front-End", skills: ["TypeScript"] }],
        additionalSkills: ["Excel"],
      },
      workingLanguage: "en",
    } as never);

    await expect(
      saveOptimizedCv(applicationId, userId, {
        ...optimizedCv,
        skills: ["TypeScript", "Excel"],
        skillGroups: [{ category: "Front-End", skills: ["TypeScript"] }],
        workingLanguage: "en",
      }),
    ).resolves.toEqual({
      ...optimizedCv,
      skills: ["TypeScript", "Excel"],
      skillGroups: [{ category: "Front-End", skills: ["TypeScript"] }],
      workingLanguage: "en",
    });
    expect(upsertOptimizedCv).toHaveBeenCalledWith(
      applicationId,
      expect.objectContaining({
        skills: ["TypeScript", "Excel"],
        skillGroups: [{ category: "Front-End", skills: ["TypeScript"] }],
      }),
      null,
      null,
      null,
      "en",
    );
    expect(getOrComputeSkillProfile).not.toHaveBeenCalled();
  });

  it("preserves skillGroups when an unrelated Optimized CV field is saved", async () => {
    vi.mocked(findOptimizedCvByApplicationId).mockResolvedValue({
      ...persistedOptimizedCv,
      skills: {
        groups: [{ category: "Front-End", skills: ["TypeScript"] }],
        additionalSkills: ["Excel"],
      },
      workingLanguage: "en",
    } as never);
    vi.mocked(upsertOptimizedCv).mockResolvedValue({
      ...persistedOptimizedCv,
      professionalSummary: "Updated summary.",
      skills: {
        groups: [{ category: "Front-End", skills: ["TypeScript"] }],
        additionalSkills: ["Excel"],
      },
      workingLanguage: "en",
    } as never);

    await expect(
      saveOptimizedCv(applicationId, userId, {
        ...optimizedCv,
        professionalSummary: "Updated summary.",
        skills: ["TypeScript", "Excel"],
        skillGroups: [{ category: "Front-End", skills: ["TypeScript"] }],
        workingLanguage: "en",
      }),
    ).resolves.toEqual({
      ...optimizedCv,
      professionalSummary: "Updated summary.",
      skills: ["TypeScript", "Excel"],
      skillGroups: [{ category: "Front-End", skills: ["TypeScript"] }],
      workingLanguage: "en",
    });
    expect(upsertOptimizedCv).toHaveBeenCalledWith(
      applicationId,
      expect.objectContaining({
        professionalSummary: "Updated summary.",
        skills: ["TypeScript", "Excel"],
        skillGroups: [{ category: "Front-End", skills: ["TypeScript"] }],
      }),
      null,
      null,
      null,
      "en",
    );
    expect(getOrComputeSkillProfile).not.toHaveBeenCalled();
  });
});
