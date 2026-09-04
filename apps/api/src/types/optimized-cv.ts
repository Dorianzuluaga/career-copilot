import type { JobAnalysisData } from "./job-analysis.js";
import type { MasterCvInput } from "./master-cv.js";
import type { ProfileComparisonResult } from "./profile-comparison.js";
import type { SupportedLocale } from "./supported-locale.js";

export type OptimizedCv = MasterCvInput & {
  profilePhotoAssetId?: string | null;
  profilePhotoPositionX?: number | null;
  profilePhotoPositionY?: number | null;
};

export type GeneratedOptimizedCvDraft = OptimizedCv & {
  workingLanguage: SupportedLocale;
};

export interface OptimizedCvGenerationInput {
  masterCv: MasterCvInput;
  jobAnalysis: JobAnalysisData;
  profileMatch: ProfileComparisonResult;
}
