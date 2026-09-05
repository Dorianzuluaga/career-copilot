import type { CoverLetter } from "../types/cover-letter.js";
import type {
  ExportDocumentType,
  ExportPreviewResponse,
} from "../types/export.js";
import type { OptimizedCv } from "../types/optimized-cv.js";
import { validateSupportedLocale } from "../types/supported-locale.js";
import {
  ApplicationError,
  getOwnedApplication,
} from "./application.service.js";
import { getCoverLetter, CoverLetterError } from "./cover-letter.service.js";
import {
  DocumentRenderingError,
  renderDocument,
} from "./document-rendering.service.js";
import { DocumentAdaptationError } from "./export-adaptation.service.js";
import {
  buildCoverLetterFilename,
  buildOptimizedCvFilename,
  readOptionalProfessionalTitle,
} from "./export-filename.js";
import {
  preparePresentationDocument,
  PresentationPreparationError,
} from "./export-presentation.service.js";
import { getMasterCv, MasterCvError } from "./master-cv.service.js";
import {
  getOptimizedCv,
  OptimizedCvError,
  readOptimizedCvPhoto,
} from "./optimized-cv.service.js";

export type { ExportDocumentType, ExportPreviewResponse };

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
    error instanceof DocumentAdaptationError ||
    error instanceof PresentationPreparationError ||
    error instanceof ExportError
  ) {
    throw new ExportError(error.message, error.statusCode);
  }
  throw error;
}

export function validateExportDocumentType(value: unknown): ExportDocumentType {
  if (value === "optimized-cv" || value === "cover-letter") {
    return value;
  }

  throw new ExportError(
    'document must be "optimized-cv" or "cover-letter".',
    400,
  );
}

export function validatePresentationLanguage(value: unknown) {
  return validateSupportedLocale(value, "presentationLanguage");
}

function validateExportRequest(
  documentType: unknown,
  presentationLanguage: unknown,
): {
  documentType: ExportDocumentType;
  presentationLanguage: ReturnType<typeof validatePresentationLanguage>;
} {
  return {
    documentType: validateExportDocumentType(documentType),
    presentationLanguage: validatePresentationLanguage(presentationLanguage),
  };
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

async function loadExportContext(
  applicationId: string,
  userId: string,
  documentType: unknown,
  presentationLanguage: unknown,
) {
  const request = validateExportRequest(documentType, presentationLanguage);
  await getOwnedApplication(applicationId, userId);
  const documents = await requireExportDocuments(applicationId, userId);
  return { ...request, ...documents };
}

async function loadOptimizedCvPhotoBytes(
  applicationId: string,
  userId: string,
  assetId: string | null | undefined,
): Promise<Buffer | null> {
  if (!assetId) {
    return null;
  }
  const photo = await readOptimizedCvPhoto(applicationId, userId, assetId);
  return photo.bytes;
}

export async function previewExportDocument(
  applicationId: string,
  userId: string,
  documentType: unknown,
  presentationLanguage: unknown,
): Promise<ExportPreviewResponse> {
  try {
    const context = await loadExportContext(
      applicationId,
      userId,
      documentType,
      presentationLanguage,
    );

    return preparePresentationDocument(
      context.documentType,
      context.presentationLanguage,
      {
        optimizedCv: context.optimizedCv,
        coverLetter: context.coverLetter,
      },
    );
  } catch (error) {
    toExportError(error);
  }
}

export async function exportApplicationDocument(
  applicationId: string,
  userId: string,
  documentType: unknown,
  presentationLanguage: unknown,
): Promise<ExportedPdf> {
  try {
    const context = await loadExportContext(
      applicationId,
      userId,
      documentType,
      presentationLanguage,
    );
    const presentation = await preparePresentationDocument(
      context.documentType,
      context.presentationLanguage,
      {
        optimizedCv: context.optimizedCv,
        coverLetter: context.coverLetter,
      },
    );
    const masterCv = await getMasterCv(userId);
    const professionalTitle = readOptionalProfessionalTitle(masterCv);
    const filename =
      presentation.document === "optimized-cv"
        ? buildOptimizedCvFilename(masterCv.fullName, professionalTitle)
        : buildCoverLetterFilename(masterCv.fullName);

    const buffer = await renderDocument(
      presentation.document === "optimized-cv"
        ? {
            type: "optimized-cv",
            data: presentation.data,
            profilePhotoBytes: await loadOptimizedCvPhotoBytes(
              applicationId,
              userId,
              presentation.data.profilePhotoAssetId,
            ),
          }
        : { type: "cover-letter", data: presentation.data },
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
