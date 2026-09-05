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

export interface OptimizedCvNarrativeAdaptation {
  professionalSummary: string;
  experienceDescriptions: Array<string | null>;
  educationDescriptions: Array<string | null>;
  personalProjectDescriptions: Array<string | null>;
}

export interface CoverLetterNarrativeAdaptation {
  greeting: string;
  introduction: string;
  professionalValue: string;
  motivation: string;
  closing: string;
}

export type ExportPreviewResponse =
  | {
      document: "optimized-cv";
      presentationLanguage: SupportedLocale;
      data: OptimizedCvPresentationDocument;
      chrome: OptimizedCvDocumentChrome;
    }
  | {
      document: "cover-letter";
      presentationLanguage: SupportedLocale;
      data: CoverLetterPresentationDocument;
      chrome: CoverLetterDocumentChrome;
    };
