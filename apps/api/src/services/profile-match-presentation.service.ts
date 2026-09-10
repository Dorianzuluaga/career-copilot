import { findProfileMatchByApplicationId } from "../repositories/profile-match.repository.js";
import type { ProfileComparisonResult } from "../types/profile-comparison.js";
import {
  isSupportedLocale,
  type SupportedLocale,
} from "../types/supported-locale.js";
import {
  ApplicationError,
  getOwnedApplication,
} from "./application.service.js";
import { adaptProfileMatchNarrative } from "./profile-match-adaptation.service.js";

export class ProfileMatchPresentationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const INVALID_SAVED_PROFILE_MATCH = "The saved Profile Match is invalid.";

export function shouldAdaptProfileMatch(
  workingLanguage: SupportedLocale | null,
  locale: SupportedLocale,
): boolean {
  return workingLanguage !== locale;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function readStoredWorkingLanguage(value: unknown): SupportedLocale | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (!isSupportedLocale(value)) {
    throw new ProfileMatchPresentationError(INVALID_SAVED_PROFILE_MATCH, 400);
  }
  return value;
}

export function assertStoredProfileMatch(
  value: unknown,
): ProfileComparisonResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ProfileMatchPresentationError(INVALID_SAVED_PROFILE_MATCH, 400);
  }

  const record = value as Record<string, unknown>;
  if (
    !isStringArray(record.matchingSkills) ||
    !isStringArray(record.missingSkills) ||
    !isStringArray(record.strengths) ||
    !isStringArray(record.weaknesses) ||
    typeof record.recommendation !== "string" ||
    typeof record.alignmentReasoning !== "string" ||
    typeof record.alignmentScore !== "number" ||
    !Number.isInteger(record.alignmentScore) ||
    record.alignmentScore < 0 ||
    record.alignmentScore > 100
  ) {
    throw new ProfileMatchPresentationError(INVALID_SAVED_PROFILE_MATCH, 400);
  }

  return {
    matchingSkills: [...record.matchingSkills],
    missingSkills: [...record.missingSkills],
    strengths: [...record.strengths],
    weaknesses: [...record.weaknesses],
    alignmentScore: record.alignmentScore,
    alignmentReasoning: record.alignmentReasoning,
    recommendation: record.recommendation,
    workingLanguage: readStoredWorkingLanguage(record.workingLanguage),
  };
}

export async function presentProfileMatch(
  applicationId: string,
  userId: string,
  locale: SupportedLocale,
): Promise<ProfileComparisonResult> {
  try {
    await getOwnedApplication(applicationId, userId);
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw new ProfileMatchPresentationError(error.message, error.statusCode);
    }
    throw error;
  }

  const row = await findProfileMatchByApplicationId(applicationId);
  if (!row) {
    throw new ProfileMatchPresentationError("Profile Match not found.", 404);
  }

  const persisted = assertStoredProfileMatch(row);
  if (!shouldAdaptProfileMatch(persisted.workingLanguage, locale)) {
    return structuredClone(persisted);
  }

  return adaptProfileMatchNarrative(persisted, locale);
}
