import type { MasterCvInput } from "./master-cv";
import type { Locale } from "../i18n/locales";

export type OptimizedCvSkillGroup = {
  category: string;
  skills: string[];
};

export type OptimizedCv = MasterCvInput & {
  skillGroups?: OptimizedCvSkillGroup[];
  profilePhotoAssetId?: string | null;
  profilePhotoPositionX?: number | null;
  profilePhotoPositionY?: number | null;
  workingLanguage: Locale | null;
};

export type GeneratedOptimizedCvDraft = OptimizedCv & {
  workingLanguage: Locale;
};
