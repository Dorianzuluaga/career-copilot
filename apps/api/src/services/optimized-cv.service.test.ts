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
  comparePreparedProfiles: vi.fn(),
}));

import { generateOptimizedCvDraft } from "./optimized-cv-ai.service.js";
import {
  generateOptimizedCv,
  OptimizedCvError,
} from "./optimized-cv.service.js";
import {
  comparePreparedProfiles,
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

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prepareProfileComparisonInput).mockResolvedValue({
    masterCv,
    jobAnalysis,
  });
  vi.mocked(comparePreparedProfiles).mockResolvedValue(profileMatch);
  vi.mocked(generateOptimizedCvDraft).mockResolvedValue(optimizedCv);
});

describe("generateOptimizedCv", () => {
  it("generates an Optimized CV from Master CV, Job Analysis, and Profile Match", async () => {
    await expect(generateOptimizedCv(applicationId, userId)).resolves.toEqual(
      optimizedCv,
    );

    expect(prepareProfileComparisonInput).toHaveBeenCalledWith(
      applicationId,
      userId,
    );
    expect(comparePreparedProfiles).toHaveBeenCalledWith({
      masterCv,
      jobAnalysis,
    });
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
    expect(comparePreparedProfiles).not.toHaveBeenCalled();
    expect(generateOptimizedCvDraft).not.toHaveBeenCalled();
  });
});
