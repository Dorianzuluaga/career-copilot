import {
  findProfileMatchByApplicationId,
  upsertProfileMatch,
} from "../repositories/profile-match.repository.js";
import type { JobAnalysisData } from "../types/job-analysis.js";
import type {
  ProfileComparisonInput,
  ProfileComparisonResult,
} from "../types/profile-comparison.js";
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

function toProfileMatchDocument(value: {
  matchingSkills: unknown;
  missingSkills: unknown;
  strengths: unknown;
  weaknesses: unknown;
  alignmentScore: number;
  alignmentReasoning: string;
  recommendation: string;
}): ProfileComparisonResult {
  return {
    matchingSkills: toStringArray(value.matchingSkills),
    missingSkills: toStringArray(value.missingSkills),
    strengths: toStringArray(value.strengths),
    weaknesses: toStringArray(value.weaknesses),
    alignmentScore: value.alignmentScore,
    alignmentReasoning: value.alignmentReasoning,
    recommendation: value.recommendation,
  };
}

async function requireOwnedApplication(applicationId: string, userId: string) {
  try {
    await getOwnedApplication(applicationId, userId);
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw new ProfileComparisonError(error.message, error.statusCode);
    }
    throw error;
  }
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

export async function comparePreparedProfiles(
  input: ProfileComparisonInput,
): Promise<ProfileComparisonResult> {
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

export async function getProfileComparison(
  applicationId: string,
  userId: string,
): Promise<ProfileComparisonResult> {
  await requireOwnedApplication(applicationId, userId);
  const profileMatch = await findProfileMatchByApplicationId(applicationId);
  if (!profileMatch) {
    throw new ProfileComparisonError("Profile Match not found.", 404);
  }
  return toProfileMatchDocument(profileMatch);
}

export async function compareProfiles(
  applicationId: string,
  userId: string,
): Promise<ProfileComparisonResult> {
  await requireOwnedApplication(applicationId, userId);

  const existing = await findProfileMatchByApplicationId(applicationId);
  if (existing) {
    return toProfileMatchDocument(existing);
  }

  const input = await prepareProfileComparisonInput(applicationId, userId);
  const comparison = await comparePreparedProfiles(input);
  const saved = await upsertProfileMatch(applicationId, comparison);
  return toProfileMatchDocument(saved);
}
