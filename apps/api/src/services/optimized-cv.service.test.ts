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
    expect(generateOptimizedCvDraft).toHaveBeenCalledWith(
      {
        masterCv,
        jobAnalysis,
        profileMatch,
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
    expect(generateOptimizedCvDraft).not.toHaveBeenCalled();
  });

  it("maps missing Profile Match errors to OptimizedCvError", async () => {
    vi.mocked(getProfileComparison).mockRejectedValue(
      new ProfileComparisonError("Profile Match not found.", 404),
    );

    await expect(
      generateOptimizedCv(applicationId, userId, "fr"),
    ).rejects.toEqual(new OptimizedCvError("Profile Match not found.", 404));
    expect(generateOptimizedCvDraft).not.toHaveBeenCalled();
  });
});

describe("getOptimizedCv", () => {
  it("returns the saved Optimized CV for an owned application", async () => {
    vi.mocked(findOptimizedCvByApplicationId).mockResolvedValue(
      persistedOptimizedCv as never,
    );

    await expect(getOptimizedCv(applicationId, userId)).resolves.toEqual(
      optimizedCv,
    );
    expect(getOwnedApplication).toHaveBeenCalledWith(applicationId, userId);
    expect(findOptimizedCvByApplicationId).toHaveBeenCalledWith(applicationId);
  });

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
});

describe("saveOptimizedCv", () => {
  it("upserts the Optimized CV for an owned application", async () => {
    await expect(
      saveOptimizedCv(applicationId, userId, optimizedCv),
    ).resolves.toEqual(optimizedCv);

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
    );
    expect(snapshotMasterCvPhoto).not.toHaveBeenCalled();
  });

  it("persists the generation-time asset and position without reading Master CV", async () => {
    const assetId = "7e9c843b-5c3d-4e65-8514-7de898b2aca6";
    const objectKey = `users/${userId}/applications/${applicationId}/optimized-cv/profile-photo/${assetId}`;
    const generated = {
      ...optimizedCv,
      profilePhotoAssetId: assetId,
      profilePhotoPositionX: 20,
      profilePhotoPositionY: 80,
    };
    vi.mocked(resolveOptimizedCvPhotoObjectKey).mockResolvedValue(objectKey);
    vi.mocked(upsertOptimizedCv).mockResolvedValue({
      ...persistedOptimizedCv,
      profilePhotoObjectKey: objectKey,
      profilePhotoPositionX: 20,
      profilePhotoPositionY: 80,
    } as never);

    await expect(
      saveOptimizedCv(applicationId, userId, generated),
    ).resolves.toMatchObject({
      profilePhotoAssetId: assetId,
      profilePhotoPositionX: 20,
      profilePhotoPositionY: 80,
    });
    expect(upsertOptimizedCv).toHaveBeenCalledWith(
      applicationId,
      expect.anything(),
      objectKey,
      20,
      80,
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
});
