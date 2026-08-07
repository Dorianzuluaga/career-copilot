import type { JobAnalysisData } from "./job-analysis.js";
import type { MasterCvInput } from "./master-cv.js";
import type { OptimizedCv } from "./optimized-cv.js";
import type { ProfileComparisonResult } from "./profile-comparison.js";

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
}

export interface CoverLetterGenerationInput {
  masterCv: MasterCvInput;
  jobAnalysis: JobAnalysisData;
  profileMatch: ProfileComparisonResult;
  optimizedCv: OptimizedCv;
}
