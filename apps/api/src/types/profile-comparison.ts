import type { JobAnalysisData } from "./job-analysis.js";
import type { MasterCvInput } from "./master-cv.js";

export interface ProfileComparisonInput {
  masterCv: MasterCvInput;
  jobAnalysis: JobAnalysisData;
}

export interface ProfileComparisonEvidence {
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface ProfileComparisonResult extends ProfileComparisonEvidence {
  alignmentScore: number;
  alignmentReasoning: string;
  recommendation: string;
}
