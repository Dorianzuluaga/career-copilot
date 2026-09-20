import {
  findCoverLetterByApplicationId,
  upsertCoverLetter,
} from "../repositories/cover-letter.repository.js";
import type {
  CoverLetter,
  GeneratedCoverLetterDraft,
} from "../types/cover-letter.js";
import type { OptimizedCv } from "../types/optimized-cv.js";
import type { SupportedLocale } from "../types/supported-locale.js";
import {
  ApplicationError,
  getOwnedApplication,
} from "./application.service.js";
import { generateCoverLetterDraft } from "./cover-letter-ai.service.js";
import {
  CoverLetterError,
  validateCoverLetterInput,
} from "./cover-letter-validation.js";
import { getOptimizedCv, OptimizedCvError } from "./optimized-cv.service.js";
import {
  getProfileComparison,
  prepareProfileComparisonInput,
  ProfileComparisonError,
} from "./profile-comparison.service.js";
import { getOrComputeSkillProfile } from "./skill-intelligence-cache.js";
import { SkillIntelligenceError } from "./skill-intelligence.js";

export { CoverLetterError, validateCoverLetterInput };

function toCoverLetterDocument(value: unknown): CoverLetter {
  return validateCoverLetterInput(value);
}

async function requireOwnedApplication(applicationId: string, userId: string) {
  try {
    await getOwnedApplication(applicationId, userId);
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw new CoverLetterError(error.message, error.statusCode);
    }
    throw error;
  }
}

async function requireSavedOptimizedCv(
  applicationId: string,
  userId: string,
): Promise<OptimizedCv> {
  try {
    return await getOptimizedCv(applicationId, userId);
  } catch (error) {
    if (error instanceof OptimizedCvError) {
      throw new CoverLetterError(error.message, error.statusCode);
    }
    throw error;
  }
}

export async function generateCoverLetter(
  applicationId: string,
  userId: string,
  locale: SupportedLocale,
): Promise<GeneratedCoverLetterDraft> {
  try {
    const input = await prepareProfileComparisonInput(applicationId, userId);
    const optimizedCv = await requireSavedOptimizedCv(applicationId, userId);
    const profileMatch = await getProfileComparison(applicationId, userId);
    const skillProfile = await getOrComputeSkillProfile({
      userId,
      applicationId,
      input: {
        masterCv: input.masterCv,
        jobAnalysis: input.jobAnalysis,
        profileMatch,
      },
    });
    return generateCoverLetterDraft(
      {
        masterCv: input.masterCv,
        jobAnalysis: input.jobAnalysis,
        profileMatch,
        optimizedCv,
        skillProfile,
      },
      locale,
    );
  } catch (error) {
    if (error instanceof CoverLetterError) {
      throw error;
    }
    if (error instanceof ProfileComparisonError) {
      throw new CoverLetterError(error.message, error.statusCode);
    }
    if (error instanceof SkillIntelligenceError) {
      throw new CoverLetterError(error.message, error.statusCode);
    }
    if (
      error instanceof Error &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
    ) {
      throw new CoverLetterError(error.message, error.statusCode);
    }
    throw error;
  }
}

export async function getCoverLetter(
  applicationId: string,
  userId: string,
): Promise<CoverLetter> {
  await requireOwnedApplication(applicationId, userId);
  const coverLetter = await findCoverLetterByApplicationId(applicationId);
  if (!coverLetter) {
    throw new CoverLetterError("Cover Letter not found.", 404);
  }
  return toCoverLetterDocument(coverLetter);
}

export async function saveCoverLetter(
  applicationId: string,
  userId: string,
  value: unknown,
): Promise<CoverLetter> {
  await requireOwnedApplication(applicationId, userId);
  const input = toCoverLetterDocument(value);
  const existing = await findCoverLetterByApplicationId(applicationId);
  if (!existing && input.workingLanguage === null) {
    throw new CoverLetterError(
      'workingLanguage must be one of "es", "en", or "fr".',
      400,
    );
  }
  const coverLetter = await upsertCoverLetter(applicationId, input);
  return toCoverLetterDocument(coverLetter);
}
