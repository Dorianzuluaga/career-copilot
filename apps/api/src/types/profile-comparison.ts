import type { JobAnalysisData } from "./job-analysis.js";
import type { MasterCvInput } from "./master-cv.js";
import type { SupportedLocale } from "./supported-locale.js";

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
  workingLanguage: SupportedLocale | null;
}

export type ProfileComparisonGenerated = Omit<
  ProfileComparisonResult,
  "workingLanguage"
>;

export interface ProfileMatchNarrativeAdaptation {
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  alignmentReasoning: string;
}
