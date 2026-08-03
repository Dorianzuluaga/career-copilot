import {
  findOptimizedCvByApplicationId,
  upsertOptimizedCv,
} from "../repositories/optimized-cv.repository.js";
import type { OptimizedCv } from "../types/optimized-cv.js";
import {
  ApplicationError,
  getOwnedApplication,
} from "./application.service.js";
import { MasterCvError, validateMasterCvInput } from "./master-cv.service.js";
import { generateOptimizedCvDraft } from "./optimized-cv-ai.service.js";
import {
  comparePreparedProfiles,
  prepareProfileComparisonInput,
  ProfileComparisonError,
} from "./profile-comparison.service.js";

export class OptimizedCvError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

function toOptimizedCvDocument(value: unknown): OptimizedCv {
  try {
    return validateMasterCvInput(value);
  } catch (error) {
    if (error instanceof MasterCvError) {
      throw new OptimizedCvError(error.message, error.statusCode);
    }
    throw error;
  }
}

async function requireOwnedApplication(applicationId: string, userId: string) {
  try {
    await getOwnedApplication(applicationId, userId);
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw new OptimizedCvError(error.message, error.statusCode);
    }
    throw error;
  }
}

export async function generateOptimizedCv(
  applicationId: string,
  userId: string,
): Promise<OptimizedCv> {
  try {
    const input = await prepareProfileComparisonInput(applicationId, userId);
    const profileMatch = await comparePreparedProfiles(input);
    return generateOptimizedCvDraft({
      masterCv: input.masterCv,
      jobAnalysis: input.jobAnalysis,
      profileMatch,
    });
  } catch (error) {
    if (error instanceof ProfileComparisonError) {
      throw new OptimizedCvError(error.message, error.statusCode);
    }
    if (
      error instanceof Error &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
    ) {
      throw new OptimizedCvError(error.message, error.statusCode);
    }
    throw error;
  }
}

export async function getOptimizedCv(
  applicationId: string,
  userId: string,
): Promise<OptimizedCv> {
  await requireOwnedApplication(applicationId, userId);
  const optimizedCv = await findOptimizedCvByApplicationId(applicationId);
  if (!optimizedCv) {
    throw new OptimizedCvError("Optimized CV not found.", 404);
  }
  return toOptimizedCvDocument(optimizedCv);
}

export async function saveOptimizedCv(
  applicationId: string,
  userId: string,
  value: unknown,
): Promise<OptimizedCv> {
  await requireOwnedApplication(applicationId, userId);
  const input = toOptimizedCvDocument(value);
  const optimizedCv = await upsertOptimizedCv(applicationId, input);
  return toOptimizedCvDocument(optimizedCv);
}
