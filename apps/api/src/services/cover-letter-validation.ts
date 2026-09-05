import {
  isValidDate,
  isValidEmail,
  isValidPhone,
} from "../lib/field-validation.js";
import type { CoverLetter } from "../types/cover-letter.js";
import {
  parseNullableSupportedLocale,
  SupportedLocaleValidationError,
  type SupportedLocale,
} from "../types/supported-locale.js";

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

function parseWorkingLanguage(value: unknown): SupportedLocale | null {
  try {
    return parseNullableSupportedLocale(value, "workingLanguage");
  } catch (error) {
    if (error instanceof SupportedLocaleValidationError) {
      throw new CoverLetterError(error.message, error.statusCode);
    }
    throw error;
  }
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
    workingLanguage: parseWorkingLanguage(input.workingLanguage),
  };
}
