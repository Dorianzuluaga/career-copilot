export interface JobOffer {
  id: string;
  applicationId: string;
  title: string | null;
  company: string | null;
  originalDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobAnalysis {
  id: string;
  applicationId: string;
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
  analysisVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface PersistedApplication {
  id: string;
  userId: string;
  status: "NEW";
  jobOffer: JobOffer | null;
  jobAnalysis: JobAnalysis | null;
  createdAt: string;
  updatedAt: string;
}
