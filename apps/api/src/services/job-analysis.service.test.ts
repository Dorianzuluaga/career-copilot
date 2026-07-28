import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/job-analysis.repository.js", () => ({
  createJobAnalysis: vi.fn(),
  findJobAnalysisByApplicationId: vi.fn(),
}));

vi.mock("../repositories/job-offer.repository.js", () => ({
  findJobOfferByApplicationId: vi.fn(),
}));

vi.mock("./application.service.js", () => ({
  getOwnedApplication: vi.fn(),
}));

vi.mock("./job-analysis-extraction.service.js", () => ({
  extractJobAnalysis: vi.fn(),
}));

import {
  createJobAnalysis,
  findJobAnalysisByApplicationId,
} from "../repositories/job-analysis.repository.js";
import { findJobOfferByApplicationId } from "../repositories/job-offer.repository.js";
import { getOwnedApplication } from "./application.service.js";
import { extractJobAnalysis } from "./job-analysis-extraction.service.js";
import { analyzeJobOffer, JobAnalysisError } from "./job-analysis.service.js";

const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const userId = "4e9c843b-5c3d-4e65-8514-7de898b2aca6";
const analysis = {
  title: "Software Engineer",
  company: null,
  employmentType: null,
  location: null,
  experienceLevel: null,
  education: null,
  languages: [],
  summary: null,
  requiredSkills: ["TypeScript"],
  responsibilities: ["Build APIs"],
  atsKeywords: ["TypeScript"],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOwnedApplication).mockResolvedValue({
    id: applicationId,
  } as never);
});

describe("analyzeJobOffer", () => {
  it("reuses a persisted analysis without another OpenAI call", async () => {
    vi.mocked(findJobAnalysisByApplicationId).mockResolvedValue(
      analysis as never,
    );

    await expect(analyzeJobOffer(applicationId, userId)).resolves.toBe(
      analysis,
    );
    expect(getOwnedApplication).toHaveBeenCalledWith(applicationId, userId);
    expect(extractJobAnalysis).not.toHaveBeenCalled();
    expect(createJobAnalysis).not.toHaveBeenCalled();
  });

  it("extracts and persists a complete analysis from the original offer", async () => {
    vi.mocked(findJobAnalysisByApplicationId).mockResolvedValue(null);
    vi.mocked(findJobOfferByApplicationId).mockResolvedValue({
      originalDescription: "Original job description",
    } as never);
    vi.mocked(extractJobAnalysis).mockResolvedValue(analysis);
    vi.mocked(createJobAnalysis).mockResolvedValue(analysis as never);

    await expect(analyzeJobOffer(applicationId, userId)).resolves.toBe(
      analysis,
    );
    expect(extractJobAnalysis).toHaveBeenCalledWith("Original job description");
    expect(createJobAnalysis).toHaveBeenCalledWith(applicationId, analysis);
  });

  it("does not persist a partial result when extraction fails", async () => {
    vi.mocked(findJobAnalysisByApplicationId).mockResolvedValue(null);
    vi.mocked(findJobOfferByApplicationId).mockResolvedValue({
      originalDescription: "Original job description",
    } as never);
    vi.mocked(extractJobAnalysis).mockRejectedValue(new Error("OpenAI failed"));

    await expect(analyzeJobOffer(applicationId, userId)).rejects.toEqual(
      new JobAnalysisError("We couldn't analyze this job description.", 502),
    );
    expect(createJobAnalysis).not.toHaveBeenCalled();
  });
});
