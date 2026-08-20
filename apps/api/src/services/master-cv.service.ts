import {
  isValidDate,
  isValidEmail,
  isValidPhone,
  isValidUrl,
} from "../lib/field-validation.js";
import {
  createMasterCv,
  findMasterCvByUserId,
  updateMasterCv,
} from "../repositories/master-cv.repository.js";
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  MasterCvInput,
  PersonalProjectItem,
} from "../types/master-cv.js";

export class MasterCvError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isExperience(value: unknown): value is ExperienceItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    isNullableString(item.jobTitle) &&
    isNullableString(item.company) &&
    isNullableString(item.location) &&
    isNullableString(item.startDate) &&
    isNullableString(item.endDate) &&
    (item.current === null || typeof item.current === "boolean") &&
    isNullableString(item.description)
  );
}

function isEducation(value: unknown): value is EducationItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    isNullableString(item.institution) &&
    isNullableString(item.degree) &&
    isNullableString(item.fieldOfStudy) &&
    isNullableString(item.startDate) &&
    isNullableString(item.endDate) &&
    isNullableString(item.description)
  );
}

function isLanguage(value: unknown): value is LanguageItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return isNullableString(item.name) && isNullableString(item.proficiency);
}

function isCertification(value: unknown): value is CertificationItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    isNullableString(item.name) &&
    isNullableString(item.issuer) &&
    isNullableString(item.issueDate) &&
    isNullableString(item.credentialUrl)
  );
}

function isPersonalProject(value: unknown): value is PersonalProjectItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    isNullableString(item.name) &&
    isNullableString(item.description) &&
    isNullableString(item.technologies) &&
    isNullableString(item.url)
  );
}

function requiredString(input: Record<string, unknown>, field: string): string {
  const value = input[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new MasterCvError(`${field} is required.`, 400);
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
    throw new MasterCvError(`${field} must be a string or null.`, 400);
  }
  return value.trim() || null;
}

function requiredEmail(input: Record<string, unknown>, field: string): string {
  const value = requiredString(input, field);
  if (!isValidEmail(value)) {
    throw new MasterCvError(`${field} must be a valid email address.`, 400);
  }
  return value;
}

function optionalFormatted(
  value: string | null,
  field: string,
  isValid: (candidate: string) => boolean,
  kind: "phone number" | "URL" | "date",
): string | null {
  if (value === null || value.trim() === "") return null;
  const trimmed = value.trim();
  if (!isValid(trimmed)) {
    throw new MasterCvError(`${field} must be a valid ${kind}.`, 400);
  }
  return trimmed;
}

function optionalPhone(
  input: Record<string, unknown>,
  field: string,
): string | null {
  return optionalFormatted(
    optionalString(input, field),
    field,
    isValidPhone,
    "phone number",
  );
}

function optionalUrl(
  input: Record<string, unknown>,
  field: string,
): string | null {
  return optionalFormatted(
    optionalString(input, field),
    field,
    isValidUrl,
    "URL",
  );
}

function arrayOf<T>(
  input: Record<string, unknown>,
  field: string,
  guard: (value: unknown) => value is T,
  required = false,
): T[] {
  const value = input[field];
  if (!Array.isArray(value) || !value.every(guard)) {
    throw new MasterCvError(`${field} is invalid.`, 400);
  }
  if (required && value.length === 0) {
    throw new MasterCvError(`${field} must contain at least one item.`, 400);
  }
  return value;
}

function optionalArrayOf<T>(
  input: Record<string, unknown>,
  field: string,
  guard: (value: unknown) => value is T,
): T[] | undefined {
  if (!(field in input) || input[field] === undefined) {
    return undefined;
  }
  return arrayOf(input, field, guard);
}

export function validateMasterCvInput(value: unknown): MasterCvInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new MasterCvError("Master CV data is required.", 400);
  }
  const input = value as Record<string, unknown>;
  const skills = arrayOf(
    input,
    "skills",
    (item): item is string => {
      return typeof item === "string" && item.trim() !== "";
    },
    true,
  ).map((skill) => skill.trim());
  const personalProjects = optionalArrayOf(
    input,
    "personalProjects",
    isPersonalProject,
  );

  return {
    fullName: requiredString(input, "fullName"),
    email: requiredEmail(input, "email"),
    phone: optionalPhone(input, "phone"),
    location: optionalString(input, "location"),
    linkedin: optionalUrl(input, "linkedin"),
    portfolio: optionalUrl(input, "portfolio"),
    professionalSummary: requiredString(input, "professionalSummary"),
    experience: arrayOf(input, "experience", isExperience, true).map(
      (item, index) => ({
        ...item,
        startDate: optionalFormatted(
          item.startDate,
          `experience[${index}].startDate`,
          isValidDate,
          "date",
        ),
        endDate: optionalFormatted(
          item.endDate,
          `experience[${index}].endDate`,
          isValidDate,
          "date",
        ),
      }),
    ),
    education: arrayOf(input, "education", isEducation).map((item, index) => ({
      ...item,
      startDate: optionalFormatted(
        item.startDate,
        `education[${index}].startDate`,
        isValidDate,
        "date",
      ),
      endDate: optionalFormatted(
        item.endDate,
        `education[${index}].endDate`,
        isValidDate,
        "date",
      ),
    })),
    skills,
    languages: arrayOf(input, "languages", isLanguage),
    certifications: arrayOf(input, "certifications", isCertification).map(
      (item, index) => ({
        ...item,
        issueDate: optionalFormatted(
          item.issueDate,
          `certifications[${index}].issueDate`,
          isValidDate,
          "date",
        ),
        credentialUrl: optionalFormatted(
          item.credentialUrl,
          `certifications[${index}].credentialUrl`,
          isValidUrl,
          "URL",
        ),
      }),
    ),
    ...(personalProjects === undefined
      ? {}
      : {
          personalProjects: personalProjects.map((item, index) => ({
            ...item,
            url: optionalFormatted(
              item.url,
              `personalProjects[${index}].url`,
              isValidUrl,
              "URL",
            ),
          })),
        }),
  };
}

export async function getMasterCv(userId: string) {
  const masterCv = await findMasterCvByUserId(userId);
  if (!masterCv) throw new MasterCvError("Master CV not found.", 404);
  return masterCv;
}

export async function addMasterCv(userId: string, value: unknown) {
  if (await findMasterCvByUserId(userId)) {
    throw new MasterCvError("A Master CV already exists.", 409);
  }
  return createMasterCv(userId, validateMasterCvInput(value));
}

export async function editMasterCv(userId: string, value: unknown) {
  if (!(await findMasterCvByUserId(userId))) {
    throw new MasterCvError("Master CV not found.", 404);
  }
  return updateMasterCv(userId, validateMasterCvInput(value));
}
