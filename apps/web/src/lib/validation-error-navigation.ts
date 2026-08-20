import { hasFieldErrors, type FieldErrors } from "./field-validation";

const FIELD_LABELS: Record<string, string> = {
  fullName: "Full name",
  email: "Email",
  phone: "Phone",
  linkedin: "LinkedIn",
  portfolio: "Portfolio",
  professionalSummary: "Professional summary",
  skills: "Skills",
  companyName: "Company name",
  jobTitle: "Job title",
  jobUrl: "Job URL",
  jobDescription: "Job description",
  candidateName: "Candidate name",
  date: "Date",
  signature: "Signature",
};

export function getFieldLabel(key: string): string {
  const label = FIELD_LABELS[key];
  if (label) return label;

  const indexed = key.match(
    /^(experience|education|personalProjects|certifications)\.(\d+)\.(.+)$/,
  );
  if (!indexed) return key;

  const collection = indexed[1];
  const position = Number(indexed[2]) + 1;
  const field = indexed[3];

  if (collection === "experience") {
    if (field === "startDate") return `Experience ${position} start date`;
    if (field === "endDate") return `Experience ${position} end date`;
  }
  if (collection === "education") {
    if (field === "startDate") return `Education ${position} start date`;
    if (field === "endDate") return `Education ${position} end date`;
  }
  if (collection === "personalProjects" && field === "url") {
    return `Project ${position} URL`;
  }
  if (collection === "certifications") {
    if (field === "issueDate") return `Certification ${position} issue date`;
    if (field === "credentialUrl") {
      return `Certification ${position} credential URL`;
    }
  }

  return key;
}

export function firstInvalidFieldKey(errors: FieldErrors): string | undefined {
  return Object.keys(errors)[0];
}

export function getValidationToastMessage(errors: FieldErrors): string | null {
  if (!hasFieldErrors(errors)) return null;

  const names = Object.keys(errors).map(getFieldLabel);
  const listed = listFieldNames(names);
  if (names.length === 1) {
    return `Changes could not be saved. ${listed} has a validation error.`;
  }
  return `Changes could not be saved. ${listed} have validation errors.`;
}

export function focusFirstInvalidField(errors: FieldErrors): void {
  if (typeof document === "undefined") return;

  const key = firstInvalidFieldKey(errors);
  if (!key) return;

  const element = findInvalidFieldElement(key);
  if (!element) return;

  if (typeof element.scrollIntoView === "function") {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if (typeof element.focus === "function") {
    element.focus({ preventScroll: true });
  }
}

function listFieldNames(names: string[]): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  if (names.length <= 4) {
    return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
  }
  const remaining = names.length - 3;
  return `${names.slice(0, 3).join(", ")}, and ${remaining} more fields`;
}

function findInvalidFieldElement(key: string): HTMLElement | null {
  const exact = document.querySelector<HTMLElement>(
    `[data-field="${escapeAttributeValue(key)}"]`,
  );
  if (exact) return exact;

  const group = fieldGroupKey(key);
  if (!group) return null;
  return document.querySelector<HTMLElement>(
    `[data-field-group="${escapeAttributeValue(group)}"]`,
  );
}

function fieldGroupKey(key: string): string | null {
  const parts = key.split(".");
  if (parts.length < 3) return null;
  return `${parts[0]}.${parts[1]}`;
}

function escapeAttributeValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
