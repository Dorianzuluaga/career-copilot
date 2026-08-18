export interface ExperienceItem {
  jobTitle: string | null;
  company: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean | null;
  description: string | null;
}

export interface EducationItem {
  institution: string | null;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

export interface LanguageItem {
  name: string | null;
  proficiency: string | null;
}

export interface CertificationItem {
  name: string | null;
  issuer: string | null;
  issueDate: string | null;
  credentialUrl: string | null;
}

export interface PersonalProjectItem {
  name: string | null;
  description: string | null;
  technologies: string | null;
  url: string | null;
}

export interface PersonalInformation {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  portfolio: string | null;
}

export interface MasterCvExtraction {
  personalInformation: PersonalInformation;
  professionalSummary: string | null;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  personalProjects: PersonalProjectItem[];
}

export interface MasterCvInput {
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  portfolio: string | null;
  professionalSummary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  personalProjects?: PersonalProjectItem[];
}
