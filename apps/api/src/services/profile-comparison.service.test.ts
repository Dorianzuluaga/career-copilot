import { beforeEach, describe, expect, it, vi } from "vitest";

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
  getMasterCv: vi.fn(),
  validateMasterCvInput: vi.fn(),
}));

vi.mock("./profile-comparison-ai.service.js", () => ({
  evaluateProfileAlignment: vi.fn(),
  generateRecommendation: vi.fn(),
  identifyMatchingSkills: vi.fn(),
  identifyMissingSkills: vi.fn(),
  identifyStrengths: vi.fn(),
  identifyWeaknesses: vi.fn(),
}));

vi.mock("../repositories/profile-match.repository.js", () => ({
  findProfileMatchByApplicationId: vi.fn(),
  upsertProfileMatch: vi.fn(),
}));

import {
  findProfileMatchByApplicationId,
  upsertProfileMatch,
} from "../repositories/profile-match.repository.js";
import {
  ApplicationError,
  getOwnedApplication,
} from "./application.service.js";
import { getMasterCv, validateMasterCvInput } from "./master-cv.service.js";
import {
  evaluateProfileAlignment,
  generateRecommendation,
  identifyMatchingSkills,
  identifyMissingSkills,
  identifyStrengths,
  identifyWeaknesses,
} from "./profile-comparison-ai.service.js";
import {
  compareProfiles,
  getProfileComparison,
  prepareProfileComparisonInput,
  ProfileComparisonError,
} from "./profile-comparison.service.js";

const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const userId = "4e9c843b-5c3d-4e65-8514-7de898b2aca6";

const jobAnalysis = {
  title: "Software Engineer",
  company: "Acme",
  employmentType: "Full-time",
  location: "Remote",
  experienceLevel: "Mid-level",
  education: null,
  languages: ["English"],
  summary: "Build web products.",
  requiredSkills: ["TypeScript", "Docker"],
  responsibilities: ["Build APIs"],
  atsKeywords: ["TypeScript"],
};

const masterCvInput = {
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

const profileMatch = {
  matchingSkills: ["TypeScript", "REST APIs"],
  missingSkills: ["Docker"],
  strengths: [
    "TypeScript experience directly supports the role's core requirement.",
  ],
  weaknesses: [
    "Docker is required by the role but is not demonstrated in the Master CV.",
  ],
  alignmentScore: 72,
  alignmentReasoning:
    "Relevant backend experience supports the role, but Docker is missing.",
  recommendation: "Good opportunity. Improve your CV before applying.",
};

const persistedProfileMatch = {
  id: "profile-match-id",
  applicationId,
  ...profileMatch,
  createdAt: new Date("2026-08-11T10:00:00.000Z"),
  updatedAt: new Date("2026-08-11T10:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOwnedApplication).mockResolvedValue({
    id: applicationId,
    jobAnalysis,
  } as never);
  vi.mocked(getMasterCv).mockResolvedValue({
    id: "master-cv-id",
    ...masterCvInput,
  } as never);
  vi.mocked(validateMasterCvInput).mockReturnValue(masterCvInput);
  vi.mocked(findProfileMatchByApplicationId).mockResolvedValue(null);
  vi.mocked(upsertProfileMatch).mockResolvedValue(
    persistedProfileMatch as never,
  );
  vi.mocked(evaluateProfileAlignment).mockResolvedValue({
    alignmentScore: 72,
    alignmentReasoning:
      "Relevant backend experience supports the role, but Docker is missing.",
  });
  vi.mocked(generateRecommendation).mockResolvedValue({
    recommendation: "Good opportunity. Improve your CV before applying.",
  });
});

describe("prepareProfileComparisonInput", () => {
  it("prepares the owned application inputs without performing a comparison", async () => {
    await expect(
      prepareProfileComparisonInput(applicationId, userId),
    ).resolves.toEqual({
      masterCv: masterCvInput,
      jobAnalysis,
    });

    expect(getOwnedApplication).toHaveBeenCalledWith(applicationId, userId);
    expect(getMasterCv).toHaveBeenCalledWith(userId);
    expect(validateMasterCvInput).toHaveBeenCalledOnce();
  });

  it("returns 404 when the application has no Job Analysis", async () => {
    vi.mocked(getOwnedApplication).mockResolvedValue({
      id: applicationId,
      jobAnalysis: null,
    } as never);

    await expect(
      prepareProfileComparisonInput(applicationId, userId),
    ).rejects.toEqual(
      new ProfileComparisonError("Job analysis not found.", 404),
    );
    expect(getMasterCv).not.toHaveBeenCalled();
  });

  it("propagates a missing Master CV error", async () => {
    const error = Object.assign(new Error("Master CV not found."), {
      statusCode: 404,
    });
    vi.mocked(getMasterCv).mockRejectedValue(error);

    await expect(
      prepareProfileComparisonInput(applicationId, userId),
    ).rejects.toBe(error);
  });
});

describe("getProfileComparison", () => {
  it("returns the saved Profile Match for an owned application", async () => {
    vi.mocked(findProfileMatchByApplicationId).mockResolvedValue(
      persistedProfileMatch as never,
    );

    await expect(getProfileComparison(applicationId, userId)).resolves.toEqual(
      profileMatch,
    );
    expect(getOwnedApplication).toHaveBeenCalledWith(applicationId, userId);
    expect(findProfileMatchByApplicationId).toHaveBeenCalledWith(applicationId);
  });

  it("returns 404 when no saved Profile Match exists", async () => {
    await expect(getProfileComparison(applicationId, userId)).rejects.toEqual(
      new ProfileComparisonError("Profile Match not found.", 404),
    );
  });

  it("maps missing application ownership to ProfileComparisonError", async () => {
    vi.mocked(getOwnedApplication).mockRejectedValue(
      new ApplicationError("Application not found.", 404),
    );

    await expect(getProfileComparison(applicationId, userId)).rejects.toEqual(
      new ProfileComparisonError("Application not found.", 404),
    );
    expect(findProfileMatchByApplicationId).not.toHaveBeenCalled();
  });
});

describe("compareProfiles", () => {
  it("generates, persists, and returns the Profile Match when none exists", async () => {
    vi.mocked(identifyMatchingSkills).mockResolvedValue({
      matchingSkills: ["TypeScript", "REST APIs"],
    });
    vi.mocked(identifyMissingSkills).mockResolvedValue({
      missingSkills: ["Docker"],
    });
    vi.mocked(identifyStrengths).mockResolvedValue({
      strengths: [
        "TypeScript experience directly supports the role's core requirement.",
      ],
    });
    vi.mocked(identifyWeaknesses).mockResolvedValue({
      weaknesses: [
        "Docker is required by the role but is not demonstrated in the Master CV.",
      ],
    });

    await expect(compareProfiles(applicationId, userId)).resolves.toEqual(
      profileMatch,
    );
    expect(identifyMatchingSkills).toHaveBeenCalledWith({
      masterCv: masterCvInput,
      jobAnalysis,
    });
    expect(identifyMissingSkills).toHaveBeenCalledWith({
      masterCv: masterCvInput,
      jobAnalysis,
    });
    expect(identifyStrengths).toHaveBeenCalledWith({
      masterCv: masterCvInput,
      jobAnalysis,
    });
    expect(identifyWeaknesses).toHaveBeenCalledWith({
      masterCv: masterCvInput,
      jobAnalysis,
    });
    expect(evaluateProfileAlignment).toHaveBeenCalledWith(
      {
        masterCv: masterCvInput,
        jobAnalysis,
      },
      {
        matchingSkills: ["TypeScript", "REST APIs"],
        missingSkills: ["Docker"],
        strengths: [
          "TypeScript experience directly supports the role's core requirement.",
        ],
        weaknesses: [
          "Docker is required by the role but is not demonstrated in the Master CV.",
        ],
      },
    );
    expect(generateRecommendation).toHaveBeenCalledWith(
      {
        masterCv: masterCvInput,
        jobAnalysis,
      },
      {
        matchingSkills: ["TypeScript", "REST APIs"],
        missingSkills: ["Docker"],
        strengths: [
          "TypeScript experience directly supports the role's core requirement.",
        ],
        weaknesses: [
          "Docker is required by the role but is not demonstrated in the Master CV.",
        ],
        alignmentScore: 72,
        alignmentReasoning:
          "Relevant backend experience supports the role, but Docker is missing.",
      },
    );
    expect(upsertProfileMatch).toHaveBeenCalledWith(
      applicationId,
      profileMatch,
    );
    expect(
      vi.mocked(evaluateProfileAlignment).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(generateRecommendation).mock.invocationCallOrder[0]!,
    );
  });

  it("returns the saved Profile Match without calling AI when one already exists", async () => {
    vi.mocked(findProfileMatchByApplicationId).mockResolvedValue(
      persistedProfileMatch as never,
    );

    await expect(compareProfiles(applicationId, userId)).resolves.toEqual(
      profileMatch,
    );
    expect(identifyMatchingSkills).not.toHaveBeenCalled();
    expect(identifyMissingSkills).not.toHaveBeenCalled();
    expect(identifyStrengths).not.toHaveBeenCalled();
    expect(identifyWeaknesses).not.toHaveBeenCalled();
    expect(evaluateProfileAlignment).not.toHaveBeenCalled();
    expect(generateRecommendation).not.toHaveBeenCalled();
    expect(upsertProfileMatch).not.toHaveBeenCalled();
    expect(getMasterCv).not.toHaveBeenCalled();
  });

  it("returns empty lists when the comparison finds no supported evidence", async () => {
    const emptyComparison = {
      matchingSkills: [],
      missingSkills: [],
      strengths: [],
      weaknesses: [],
      alignmentScore: 72,
      alignmentReasoning:
        "Relevant backend experience supports the role, but Docker is missing.",
      recommendation: "Good opportunity. Improve your CV before applying.",
    };
    vi.mocked(identifyMatchingSkills).mockResolvedValue({
      matchingSkills: [],
    });
    vi.mocked(identifyMissingSkills).mockResolvedValue({
      missingSkills: [],
    });
    vi.mocked(identifyStrengths).mockResolvedValue({
      strengths: [],
    });
    vi.mocked(identifyWeaknesses).mockResolvedValue({
      weaknesses: [],
    });
    vi.mocked(upsertProfileMatch).mockResolvedValue({
      id: "profile-match-id",
      applicationId,
      ...emptyComparison,
      createdAt: new Date("2026-08-11T10:00:00.000Z"),
      updatedAt: new Date("2026-08-11T10:00:00.000Z"),
    } as never);

    await expect(compareProfiles(applicationId, userId)).resolves.toEqual(
      emptyComparison,
    );
    expect(evaluateProfileAlignment).toHaveBeenCalledWith(expect.any(Object), {
      matchingSkills: [],
      missingSkills: [],
      strengths: [],
      weaknesses: [],
    });
    expect(generateRecommendation).toHaveBeenCalledWith(expect.any(Object), {
      matchingSkills: [],
      missingSkills: [],
      strengths: [],
      weaknesses: [],
      alignmentScore: 72,
      alignmentReasoning:
        "Relevant backend experience supports the role, but Docker is missing.",
    });
    expect(upsertProfileMatch).toHaveBeenCalledWith(
      applicationId,
      emptyComparison,
    );
  });
});
