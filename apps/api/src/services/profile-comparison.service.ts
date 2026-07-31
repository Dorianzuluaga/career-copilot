import type { JobAnalysisData } from "../types/job-analysis.js";
import type {
  ProfileComparisonInput,
  ProfileComparisonResult,
} from "../types/profile-comparison.js";
import { getOwnedApplication } from "./application.service.js";
import { getMasterCv, validateMasterCvInput } from "./master-cv.service.js";
import {
  evaluateProfileAlignment,
  generateRecommendation,
  identifyMatchingSkills,
  identifyMissingSkills,
  identifyStrengths,
  identifyWeaknesses,
} from "./profile-comparison-ai.service.js";

export class ProfileComparisonError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toJobAnalysisData(
  jobAnalysis: NonNullable<
    Awaited<ReturnType<typeof getOwnedApplication>>["jobAnalysis"]
  >,
): JobAnalysisData {
  return {
    title: jobAnalysis.title,
    company: jobAnalysis.company,
    employmentType: jobAnalysis.employmentType,
    location: jobAnalysis.location,
    experienceLevel: jobAnalysis.experienceLevel,
    education: jobAnalysis.education,
    languages: toStringArray(jobAnalysis.languages),
    summary: jobAnalysis.summary,
    requiredSkills: toStringArray(jobAnalysis.requiredSkills),
    responsibilities: toStringArray(jobAnalysis.responsibilities),
    atsKeywords: toStringArray(jobAnalysis.atsKeywords),
  };
}

export async function prepareProfileComparisonInput(
  applicationId: string,
  userId: string,
): Promise<ProfileComparisonInput> {
  const application = await getOwnedApplication(applicationId, userId);
  if (!application.jobAnalysis) {
    throw new ProfileComparisonError("Job analysis not found.", 404);
  }

  const masterCv = await getMasterCv(userId);

  return {
    masterCv: validateMasterCvInput(masterCv),
    jobAnalysis: toJobAnalysisData(application.jobAnalysis),
  };
}

export async function compareProfiles(
  applicationId: string,
  userId: string,
): Promise<ProfileComparisonResult> {
  const input = await prepareProfileComparisonInput(applicationId, userId);
  const [matchingSkills, missingSkills, strengths, weaknesses] =
    await Promise.all([
      identifyMatchingSkills(input),
      identifyMissingSkills(input),
      identifyStrengths(input),
      identifyWeaknesses(input),
    ]);

  const comparison = {
    ...matchingSkills,
    ...missingSkills,
    ...strengths,
    ...weaknesses,
  };
  const alignment = await evaluateProfileAlignment(input, comparison);
  const alignedComparison = { ...comparison, ...alignment };
  const recommendation = await generateRecommendation(input, alignedComparison);

  return { ...alignedComparison, ...recommendation };
}
