import type { Locale } from "../i18n/locales";
import type { CoverLetter } from "./cover-letter";
import type { OptimizedCv } from "./optimized-cv";

export type ExportDocumentType = "optimized-cv" | "cover-letter";

export type PresentationLanguage = Locale;

export type ExportPreviewResponse =
  | {
      document: "optimized-cv";
      presentationLanguage: PresentationLanguage;
      data: OptimizedCv;
    }
  | {
      document: "cover-letter";
      presentationLanguage: PresentationLanguage;
      data: CoverLetter;
    };
