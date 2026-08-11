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

import {
  findOptimizedCvByApplicationId,
  upsertOptimizedCv,
} from "../repositories/optimized-cv.repository.js";
import {
  ApplicationError,
  getOwnedApplication,
} from "./application.service.js";
import { MasterCvError, validateMasterCvInput } from "./master-cv.service.js";
import { generateOptimizedCvDraft } from "./optimized-cv-ai.service.js";
import {
  generateOptimizedCv,
  getOptimizedCv,
  OptimizedCvError,
  saveOptimizedCv,
} from "./optimized-cv.service.js";
import {
  getProfileComparison,
  prepareProfileComparisonInput,
  ProfileComparisonError,
} from "./profile-comparison.service.js";

const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const userId = "4e9c843b-5c3d-4e65-8514-7de898b2aca6";

const masterCv = {
  fullName: "Taylor Smith",
  email: "taylor@example.com",
  phone: null,
  location: null,
  linkedin: null,
  portfolio: null,
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
  vi.mocked(generateOptimizedCvDraft).mockResolvedValue(optimizedCv);
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
      email: input.email,
      phone: input.phone,
      location: input.location,
      linkedin: input.linkedin,
      portfolio: input.portfolio,
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
    await expect(generateOptimizedCv(applicationId, userId)).resolves.toEqual(
      optimizedCv,
    );

    expect(prepareProfileComparisonInput).toHaveBeenCalledWith(
      applicationId,
      userId,
    );
    expect(getProfileComparison).toHaveBeenCalledWith(applicationId, userId);
    expect(generateOptimizedCvDraft).toHaveBeenCalledWith({
      masterCv,
      jobAnalysis,
      profileMatch,
    });
  });

  it("maps missing Job Analysis errors to OptimizedCvError", async () => {
    vi.mocked(prepareProfileComparisonInput).mockRejectedValue(
      new ProfileComparisonError("Job analysis not found.", 404),
    );

    await expect(generateOptimizedCv(applicationId, userId)).rejects.toEqual(
      new OptimizedCvError("Job analysis not found.", 404),
    );
    expect(getProfileComparison).not.toHaveBeenCalled();
    expect(generateOptimizedCvDraft).not.toHaveBeenCalled();
  });

  it("maps missing Profile Match errors to OptimizedCvError", async () => {
    vi.mocked(getProfileComparison).mockRejectedValue(
      new ProfileComparisonError("Profile Match not found.", 404),
    );

    await expect(generateOptimizedCv(applicationId, userId)).rejects.toEqual(
      new OptimizedCvError("Profile Match not found.", 404),
    );
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
    expect(upsertOptimizedCv).toHaveBeenCalledWith(applicationId, optimizedCv);
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
