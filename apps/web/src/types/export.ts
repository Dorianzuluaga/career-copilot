import type { Locale } from "../i18n/locales";
import type { CoverLetter } from "./cover-letter";
import type { OptimizedCv } from "./optimized-cv";

export type ExportDocumentType = "optimized-cv" | "cover-letter";

export type PresentationLanguage = Locale;

export interface OptimizedCvDocumentChrome {
  professionalSummary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
  certifications: string;
  personalProjects: string;
  present: string;
  openProject: string;
}

export interface CoverLetterDocumentChrome {
  formattedDate: string;
}

export type ExportPreviewResponse =
  | {
      document: "optimized-cv";
      presentationLanguage: PresentationLanguage;
      data: OptimizedCv;
      chrome: OptimizedCvDocumentChrome;
    }
  | {
      document: "cover-letter";
      presentationLanguage: PresentationLanguage;
      data: CoverLetter;
      chrome: CoverLetterDocumentChrome;
    };
