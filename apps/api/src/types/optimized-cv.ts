import type { JobAnalysisData } from "./job-analysis.js";
import type { MasterCvInput } from "./master-cv.js";
import type { ProfileComparisonResult } from "./profile-comparison.js";

export type OptimizedCv = MasterCvInput;

export interface OptimizedCvGenerationInput {
  masterCv: MasterCvInput;
  jobAnalysis: JobAnalysisData;
  profileMatch: ProfileComparisonResult;
}
