import type { OptimizedCv } from "../types/optimized-cv.js";
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
