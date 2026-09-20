import type { JobAnalysisData } from "./job-analysis.js";
import type { MasterCvInput } from "./master-cv.js";
import type { ProfileComparisonResult } from "./profile-comparison.js";
import type { SkillProfile } from "./skill-intelligence.js";
import type { SupportedLocale } from "./supported-locale.js";

export type OptimizedCvSkillGroup = {
  category: string;
  skills: string[];
};

export type OptimizedCvPersistedGroupedSkills = {
  groups: OptimizedCvSkillGroup[];
  additionalSkills: string[];
};

export type OptimizedCvText = MasterCvInput & {
  skillGroups?: OptimizedCvSkillGroup[];
};

export type OptimizedCv = OptimizedCvText & {
  profilePhotoAssetId?: string | null;
  profilePhotoPositionX?: number | null;
  profilePhotoPositionY?: number | null;
  workingLanguage: SupportedLocale | null;
};

export type GeneratedOptimizedCvDraft = OptimizedCv & {
  workingLanguage: SupportedLocale;
};

export interface OptimizedCvGenerationInput {
  masterCv: MasterCvInput;
  jobAnalysis: JobAnalysisData;
  profileMatch: ProfileComparisonResult;
  skillProfile: SkillProfile;
}
