export interface JobAnalysisData {
  title: string | null;
  company: string | null;
  employmentType: string | null;
  location: string | null;
  experienceLevel: string | null;
  education: string | null;
  languages: string[];
  summary: string | null;
  requiredSkills: string[];
  responsibilities: string[];
  atsKeywords: string[];
}
