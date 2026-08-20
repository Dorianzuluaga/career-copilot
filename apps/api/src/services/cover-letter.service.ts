import {
  isValidDate,
  isValidEmail,
  isValidPhone,
} from "../lib/field-validation.js";
import {
  findCoverLetterByApplicationId,
  upsertCoverLetter,
} from "../repositories/cover-letter.repository.js";
import type { CoverLetter } from "../types/cover-letter.js";
import type { OptimizedCv } from "../types/optimized-cv.js";
import {
  ApplicationError,
  getOwnedApplication,
} from "./application.service.js";
import { generateCoverLetterDraft } from "./cover-letter-ai.service.js";
import { getOptimizedCv, OptimizedCvError } from "./optimized-cv.service.js";
import {
  getProfileComparison,
  prepareProfileComparisonInput,
  ProfileComparisonError,
} from "./profile-comparison.service.js";

export class CoverLetterError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

function requiredString(input: Record<string, unknown>, field: string): string {
  const value = input[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new CoverLetterError(`${field} is required.`, 400);
  }
  return value.trim();
}

function optionalString(
  input: Record<string, unknown>,
  field: string,
): string | null {
  const value = input[field];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new CoverLetterError(`${field} must be a string or null.`, 400);
  }
  return value.trim() || null;
}

function editableString(input: Record<string, unknown>, field: string): string {
  const value = input[field];
  if (typeof value !== "string") {
    throw new CoverLetterError(`${field} must be a string.`, 400);
  }
  return value;
}

function requiredEmail(input: Record<string, unknown>, field: string): string {
  const value = requiredString(input, field);
  if (!isValidEmail(value)) {
    throw new CoverLetterError(`${field} must be a valid email address.`, 400);
  }
  return value;
}

function requiredDate(input: Record<string, unknown>, field: string): string {
  const value = requiredString(input, field);
  if (!isValidDate(value)) {
    throw new CoverLetterError(`${field} must be a valid date.`, 400);
  }
  return value;
}

function optionalPhone(
  input: Record<string, unknown>,
  field: string,
): string | null {
  const value = optionalString(input, field);
  if (value === null) return null;
  if (!isValidPhone(value)) {
    throw new CoverLetterError(`${field} must be a valid phone number.`, 400);
  }
  return value;
}

export function validateCoverLetterInput(value: unknown): CoverLetter {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CoverLetterError("Cover Letter data is required.", 400);
  }
  const input = value as Record<string, unknown>;
  return {
    candidateName: requiredString(input, "candidateName"),
    email: requiredEmail(input, "email"),
    phone: optionalPhone(input, "phone"),
    date: requiredDate(input, "date"),
    companyName: optionalString(input, "companyName"),
    greeting: editableString(input, "greeting"),
    introduction: editableString(input, "introduction"),
    professionalValue: editableString(input, "professionalValue"),
    motivation: editableString(input, "motivation"),
    closing: editableString(input, "closing"),
    signature: requiredString(input, "signature"),
  };
}

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
): Promise<CoverLetter> {
  try {
    const input = await prepareProfileComparisonInput(applicationId, userId);
    const optimizedCv = await requireSavedOptimizedCv(applicationId, userId);
    const profileMatch = await getProfileComparison(applicationId, userId);
    return generateCoverLetterDraft({
      masterCv: input.masterCv,
      jobAnalysis: input.jobAnalysis,
      profileMatch,
      optimizedCv,
    });
  } catch (error) {
    if (error instanceof CoverLetterError) {
      throw error;
    }
    if (error instanceof ProfileComparisonError) {
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
  const coverLetter = await upsertCoverLetter(applicationId, input);
  return toCoverLetterDocument(coverLetter);
}
