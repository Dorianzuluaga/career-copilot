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

const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const userId = "4e9c843b-5c3d-4e65-8514-7de898b2aca6";

const masterCv = {
  fullName: "Taylor Smith",
  email: "taylor@example.com",
  phone: "+1 555 0100",
  location: "Berlin",
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
  vi.mocked(generateCoverLetterDraft).mockResolvedValue(coverLetter);
});

describe("generateCoverLetter", () => {
  it("generates a Cover Letter from Master CV, Job Analysis, saved Profile Match, and saved Optimized CV", async () => {
    await expect(generateCoverLetter(applicationId, userId)).resolves.toEqual(
      coverLetter,
    );

    expect(prepareProfileComparisonInput).toHaveBeenCalledWith(
      applicationId,
      userId,
    );
    expect(getOptimizedCv).toHaveBeenCalledWith(applicationId, userId);
    expect(getProfileComparison).toHaveBeenCalledWith(applicationId, userId);
    expect(generateCoverLetterDraft).toHaveBeenCalledWith({
      masterCv,
      jobAnalysis,
      profileMatch,
      optimizedCv,
    });
  });

  it("returns an error when no saved Optimized CV exists", async () => {
    vi.mocked(getOptimizedCv).mockRejectedValue(
      new OptimizedCvError("Optimized CV not found.", 404),
    );

    await expect(generateCoverLetter(applicationId, userId)).rejects.toEqual(
      new CoverLetterError("Optimized CV not found.", 404),
    );
    expect(getProfileComparison).not.toHaveBeenCalled();
    expect(generateCoverLetterDraft).not.toHaveBeenCalled();
  });

  it("returns an error when no saved Profile Match exists", async () => {
    vi.mocked(getProfileComparison).mockRejectedValue(
      new ProfileComparisonError("Profile Match not found.", 404),
    );

    await expect(generateCoverLetter(applicationId, userId)).rejects.toEqual(
      new CoverLetterError("Profile Match not found.", 404),
    );
    expect(generateCoverLetterDraft).not.toHaveBeenCalled();
  });

  it("maps missing Job Analysis errors to CoverLetterError", async () => {
    vi.mocked(prepareProfileComparisonInput).mockRejectedValue(
      new ProfileComparisonError("Job analysis not found.", 404),
    );

    await expect(generateCoverLetter(applicationId, userId)).rejects.toEqual(
      new CoverLetterError("Job analysis not found.", 404),
    );
    expect(getOptimizedCv).not.toHaveBeenCalled();
    expect(getProfileComparison).not.toHaveBeenCalled();
    expect(generateCoverLetterDraft).not.toHaveBeenCalled();
  });
});

describe("getCoverLetter", () => {
  it("returns the saved Cover Letter for an owned application", async () => {
    vi.mocked(findCoverLetterByApplicationId).mockResolvedValue(
      persistedCoverLetter as never,
    );

    await expect(getCoverLetter(applicationId, userId)).resolves.toEqual(
      coverLetter,
    );
    expect(getOwnedApplication).toHaveBeenCalledWith(applicationId, userId);
    expect(findCoverLetterByApplicationId).toHaveBeenCalledWith(applicationId);
  });

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
    await expect(
      saveCoverLetter(applicationId, userId, coverLetter),
    ).resolves.toEqual(coverLetter);

    expect(getOwnedApplication).toHaveBeenCalledWith(applicationId, userId);
    expect(upsertCoverLetter).toHaveBeenCalledWith(applicationId, coverLetter);
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
