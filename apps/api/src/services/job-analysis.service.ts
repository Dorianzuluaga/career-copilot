import {
  createJobAnalysis,
  findJobAnalysisByApplicationId,
} from "../repositories/job-analysis.repository.js";
import { findJobOfferByApplicationId } from "../repositories/job-offer.repository.js";
import type { SupportedLocale } from "../types/supported-locale.js";
import { getOwnedApplication } from "./application.service.js";
import { extractJobAnalysis } from "./job-analysis-extraction.service.js";

export class JobAnalysisError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export async function analyzeJobOffer(
  applicationId: string,
  userId: string,
  locale: SupportedLocale,
) {
  await getOwnedApplication(applicationId, userId);

  const existingAnalysis = await findJobAnalysisByApplicationId(applicationId);
  if (existingAnalysis) return existingAnalysis;

  const jobOffer = await findJobOfferByApplicationId(applicationId);
  if (!jobOffer) {
    throw new JobAnalysisError("Job offer not found.", 404);
  }

  let analysis;
  try {
    analysis = await extractJobAnalysis(jobOffer.originalDescription, locale);
  } catch {
    throw new JobAnalysisError(
      "We couldn't analyze this job description.",
      502,
    );
  }

  return createJobAnalysis(applicationId, analysis);
}
