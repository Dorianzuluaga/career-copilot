import type { CoverLetter } from "../types/cover-letter.js";
import type { OptimizedCv } from "../types/optimized-cv.js";
import {
  ApplicationError,
  getOwnedApplication,
} from "./application.service.js";
import { getCoverLetter, CoverLetterError } from "./cover-letter.service.js";
import {
  DocumentRenderingError,
  renderDocument,
} from "./document-rendering.service.js";
import {
  buildCoverLetterFilename,
  buildOptimizedCvFilename,
  readOptionalProfessionalTitle,
} from "./export-filename.js";
import { getMasterCv, MasterCvError } from "./master-cv.service.js";
import {
  getOptimizedCv,
  OptimizedCvError,
} from "./optimized-cv.service.js";

export type ExportDocumentType = "optimized-cv" | "cover-letter";

export interface ExportedPdf {
  buffer: Buffer;
  filename: string;
  contentType: "application/pdf";
}

export class ExportError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

function toExportError(error: unknown): never {
  if (
    error instanceof ApplicationError ||
    error instanceof OptimizedCvError ||
    error instanceof CoverLetterError ||
    error instanceof MasterCvError ||
    error instanceof DocumentRenderingError ||
    error instanceof ExportError
  ) {
    throw new ExportError(error.message, error.statusCode);
  }
  throw error;
}

export function validateExportDocumentType(
  value: unknown,
): ExportDocumentType {
  if (value === "optimized-cv" || value === "cover-letter") {
    return value;
  }

  throw new ExportError(
    'document must be "optimized-cv" or "cover-letter".',
    400,
  );
}

async function requireExportDocuments(
  applicationId: string,
  userId: string,
): Promise<{ optimizedCv: OptimizedCv; coverLetter: CoverLetter }> {
  try {
    const optimizedCv = await getOptimizedCv(applicationId, userId);
    const coverLetter = await getCoverLetter(applicationId, userId);
    return { optimizedCv, coverLetter };
  } catch (error) {
    if (
      (error instanceof OptimizedCvError ||
        error instanceof CoverLetterError) &&
      error.statusCode === 404
    ) {
      throw new ExportError(
        "A saved Optimized CV and Cover Letter are required before export.",
        400,
      );
    }
    toExportError(error);
  }
}

export async function exportApplicationDocument(
  applicationId: string,
  userId: string,
  documentType: ExportDocumentType,
): Promise<ExportedPdf> {
  try {
    await getOwnedApplication(applicationId, userId);
    const { optimizedCv, coverLetter } = await requireExportDocuments(
      applicationId,
      userId,
    );
    const masterCv = await getMasterCv(userId);
    const professionalTitle = readOptionalProfessionalTitle(masterCv);
    const filename =
      documentType === "optimized-cv"
        ? buildOptimizedCvFilename(masterCv.fullName, professionalTitle)
        : buildCoverLetterFilename(masterCv.fullName);

    const buffer = await renderDocument(
      documentType === "optimized-cv"
        ? { type: "optimized-cv", data: optimizedCv }
        : { type: "cover-letter", data: coverLetter },
      "pdf",
    );

    return {
      buffer,
      filename,
      contentType: "application/pdf",
    };
  } catch (error) {
    toExportError(error);
  }
}
