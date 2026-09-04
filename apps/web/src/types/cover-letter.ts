import type { Locale } from "../i18n/locales";

export interface CoverLetter {
  candidateName: string;
  email: string;
  phone: string | null;
  date: string;
  companyName: string | null;
  greeting: string;
  introduction: string;
  professionalValue: string;
  motivation: string;
  closing: string;
  signature: string;
  workingLanguage?: Locale;
}

export type GeneratedCoverLetterDraft = CoverLetter & {
  workingLanguage: Locale;
};
