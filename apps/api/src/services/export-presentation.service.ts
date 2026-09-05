import type { CoverLetter } from "../types/cover-letter.js";
import type {
  ExportDocumentType,
  ExportPreviewResponse,
} from "../types/export.js";
import type { OptimizedCv } from "../types/optimized-cv.js";
import {
  isSupportedLocale,
  type SupportedLocale,
} from "../types/supported-locale.js";
import { validateCoverLetterInput } from "./cover-letter-validation.js";
import {
  adaptCoverLetterNarrative,
  adaptOptimizedCvNarrative,
} from "./export-adaptation.service.js";
import { validateMasterCvInput } from "./master-cv.service.js";

export class PresentationPreparationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export function shouldAdaptDocument(
  workingLanguage: SupportedLocale | null,
  presentationLanguage: SupportedLocale,
): boolean {
  return workingLanguage !== presentationLanguage;
}

function readStoredWorkingLanguage(
  value: { workingLanguage?: unknown },
  message: string,
): SupportedLocale | null {
  const workingLanguage = value.workingLanguage;
  if (workingLanguage === undefined || workingLanguage === null) {
    return null;
  }
  if (!isSupportedLocale(workingLanguage)) {
    throw new PresentationPreparationError(message, 400);
  }
  return workingLanguage;
}

function assertStoredOptimizedCv(value: OptimizedCv): void {
  try {
    validateMasterCvInput(value);
  } catch {
    throw new PresentationPreparationError(
      "The saved Optimized CV is invalid.",
      400,
    );
  }
  readStoredWorkingLanguage(value, "The saved Optimized CV is invalid.");
}

function assertStoredCoverLetter(value: CoverLetter): void {
  try {
    validateCoverLetterInput(value);
  } catch {
    throw new PresentationPreparationError(
      "The saved Cover Letter is invalid.",
      400,
    );
  }
  readStoredWorkingLanguage(value, "The saved Cover Letter is invalid.");
}

async function prepareOptimizedCvPresentation(
  saved: OptimizedCv,
  presentationLanguage: SupportedLocale,
): Promise<OptimizedCv> {
  if (!shouldAdaptDocument(saved.workingLanguage, presentationLanguage)) {
    return structuredClone(saved);
  }
  return adaptOptimizedCvNarrative(saved, presentationLanguage);
}

async function prepareCoverLetterPresentation(
  saved: CoverLetter,
  presentationLanguage: SupportedLocale,
): Promise<CoverLetter> {
  if (!shouldAdaptDocument(saved.workingLanguage, presentationLanguage)) {
    return structuredClone(saved);
  }
  return adaptCoverLetterNarrative(saved, presentationLanguage);
}

export async function preparePresentationDocument(
  documentType: ExportDocumentType,
  presentationLanguage: SupportedLocale,
  documents: { optimizedCv: OptimizedCv; coverLetter: CoverLetter },
): Promise<ExportPreviewResponse> {
  assertStoredOptimizedCv(documents.optimizedCv);
  assertStoredCoverLetter(documents.coverLetter);

  if (documentType === "optimized-cv") {
    return {
      document: "optimized-cv",
      presentationLanguage,
      data: await prepareOptimizedCvPresentation(
        documents.optimizedCv,
        presentationLanguage,
      ),
    };
  }

  return {
    document: "cover-letter",
    presentationLanguage,
    data: await prepareCoverLetterPresentation(
      documents.coverLetter,
      presentationLanguage,
    ),
  };
}
