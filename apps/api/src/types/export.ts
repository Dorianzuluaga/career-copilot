import type { CoverLetter } from "./cover-letter.js";
import type { OptimizedCv } from "./optimized-cv.js";
import type { SupportedLocale } from "./supported-locale.js";

export type ExportDocumentType = "optimized-cv" | "cover-letter";

export interface ExportRequest {
  document: ExportDocumentType;
  presentationLanguage: SupportedLocale;
}

export type OptimizedCvPresentationDocument = OptimizedCv;
export type CoverLetterPresentationDocument = CoverLetter;

export type ExportPreviewResponse =
  | {
      document: "optimized-cv";
      presentationLanguage: SupportedLocale;
      data: OptimizedCvPresentationDocument;
    }
  | {
      document: "cover-letter";
      presentationLanguage: SupportedLocale;
      data: CoverLetterPresentationDocument;
    };
