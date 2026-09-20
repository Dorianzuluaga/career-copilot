import type { JobAnalysisData } from "./job-analysis.js";
import type { LanguageItem, MasterCvInput } from "./master-cv.js";
import type { ProfileComparisonResult } from "./profile-comparison.js";

export const PROFESSIONAL_WEIGHTS = [
  "core_professional",
  "specialized",
  "supporting",
  "general",
] as const;

export type ProfessionalWeight = (typeof PROFESSIONAL_WEIGHTS)[number];

export const JOB_RELEVANCES = [
  "very_high",
  "high",
  "medium",
  "low",
  "none",
] as const;

export type JobRelevance = (typeof JOB_RELEVANCES)[number];

export const SKILL_EVIDENCE_SOURCES = [
  "professional_summary",
  "experience",
  "education",
  "certifications",
  "personal_projects",
  "languages",
] as const;

export type SkillEvidenceSource = (typeof SKILL_EVIDENCE_SOURCES)[number];

export type SkillEvidence = {
  source: SkillEvidenceSource;
  reference: string;
};

export type SkillProfileItem = {
  sourceSkill: string;
  canonicalSkill: string;
  category: string;
  professionalWeight: ProfessionalWeight;
  jobRelevance: JobRelevance;
  priority: number;
  evidence: SkillEvidence[];
};

export type SkillProfile = {
  skills: SkillProfileItem[];
};

export type SkillProfileAiItem = Omit<SkillProfileItem, "priority">;

export type SkillProfileAiOutput = {
  skills: SkillProfileAiItem[];
};

export type MasterCvSkillInventoryItem = {
  sourceSkill: string;
  originalIndex: number;
};

export type SkillIntelligenceJobAnalysisInput = Pick<
  JobAnalysisData,
  "requiredSkills" | "atsKeywords" | "responsibilities" | "summary"
>;

export type SkillIntelligenceProfileMatchInput = Pick<
  ProfileComparisonResult,
  | "matchingSkills"
  | "missingSkills"
  | "strengths"
  | "weaknesses"
  | "alignmentScore"
  | "alignmentReasoning"
  | "recommendation"
>;

export type SkillIntelligenceInput = {
  masterCv: MasterCvInput;
  jobAnalysis: SkillIntelligenceJobAnalysisInput;
  profileMatch: SkillIntelligenceProfileMatchInput;
};

export type SkillIntelligenceCuratedExperience = {
  jobTitle: string | null;
  company: string | null;
  description: string | null;
};

export type SkillIntelligenceCuratedEducation = {
  degree: string | null;
  fieldOfStudy: string | null;
  description: string | null;
};

export type SkillIntelligenceCuratedCertification = {
  name: string | null;
  issuer: string | null;
};

export type SkillIntelligenceCuratedPersonalProject = {
  name: string | null;
  description: string | null;
  technologies: string | null;
};

export type SkillIntelligenceCuratedMasterCv = {
  skills: string[];
  professionalSummary: string;
  experience: SkillIntelligenceCuratedExperience[];
  education: SkillIntelligenceCuratedEducation[];
  certifications: SkillIntelligenceCuratedCertification[];
  languages: LanguageItem[];
  personalProjects: SkillIntelligenceCuratedPersonalProject[];
};

export type SkillIntelligenceCuratedPayload = {
  skillInventory: MasterCvSkillInventoryItem[];
  masterCv: SkillIntelligenceCuratedMasterCv;
  jobAnalysis: SkillIntelligenceJobAnalysisInput;
  profileMatch: SkillIntelligenceProfileMatchInput;
};

export const SKILL_PROFILE_CONTRACT_VERSION = 1;

export type SkillIntelligenceFingerprintSource = {
  masterCv: SkillIntelligenceCuratedMasterCv;
  jobAnalysis: SkillIntelligenceJobAnalysisInput;
  profileMatch: SkillIntelligenceProfileMatchInput;
  skillProfileContractVersion: number;
};

export type SkillProfileCacheIdentity = {
  userId: string;
  applicationId: string;
  sourceFingerprint: string;
  skillProfileContractVersion: number;
};

const SKILL_PROFILE_AI_ITEM_KEYS = [
  "sourceSkill",
  "canonicalSkill",
  "category",
  "professionalWeight",
  "jobRelevance",
  "evidence",
] as const;

const SKILL_PROFILE_ITEM_KEYS = [
  ...SKILL_PROFILE_AI_ITEM_KEYS,
  "priority",
] as const;

const SKILL_EVIDENCE_KEYS = ["source", "reference"] as const;

const INDEXED_EVIDENCE_REFERENCES = {
  experience: /^experience\[(0|[1-9]\d*)\]$/,
  education: /^education\[(0|[1-9]\d*)\]$/,
  certifications: /^certifications\[(0|[1-9]\d*)\]$/,
  personal_projects: /^personalProjects\[(0|[1-9]\d*)\]$/,
  languages: /^languages\[(0|[1-9]\d*)\]$/,
} as const;

export const skillProfileAiOutputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["skills"],
  properties: {
    skills: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "sourceSkill",
          "canonicalSkill",
          "category",
          "professionalWeight",
          "jobRelevance",
          "evidence",
        ],
        properties: {
          sourceSkill: { type: "string" },
          canonicalSkill: { type: "string" },
          category: { type: "string" },
          professionalWeight: {
            type: "string",
            enum: PROFESSIONAL_WEIGHTS,
          },
          jobRelevance: {
            type: "string",
            enum: JOB_RELEVANCES,
          },
          evidence: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["source", "reference"],
              properties: {
                source: {
                  type: "string",
                  enum: SKILL_EVIDENCE_SOURCES,
                },
                reference: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

export function isProfessionalWeight(
  value: unknown,
): value is ProfessionalWeight {
  return (
    typeof value === "string" &&
    (PROFESSIONAL_WEIGHTS as readonly string[]).includes(value)
  );
}

export function isJobRelevance(value: unknown): value is JobRelevance {
  return (
    typeof value === "string" &&
    (JOB_RELEVANCES as readonly string[]).includes(value)
  );
}

export function isSkillEvidenceSource(
  value: unknown,
): value is SkillEvidenceSource {
  return (
    typeof value === "string" &&
    (SKILL_EVIDENCE_SOURCES as readonly string[]).includes(value)
  );
}

export function isSkillEvidence(value: unknown): value is SkillEvidence {
  if (!isRecord(value) || !hasOnlyKeys(value, SKILL_EVIDENCE_KEYS)) {
    return false;
  }
  return (
    isSkillEvidenceSource(value.source) && typeof value.reference === "string"
  );
}

export function evidenceSourceAgreesWithReference(
  source: SkillEvidenceSource,
  reference: string,
): boolean {
  if (source === "professional_summary") {
    return reference === "professionalSummary";
  }
  return INDEXED_EVIDENCE_REFERENCES[source].test(reference);
}

export function parseIndexedEvidenceReference(
  source: SkillEvidenceSource,
  reference: string,
): number | null {
  if (source === "professional_summary") {
    return null;
  }
  const match = reference.match(INDEXED_EVIDENCE_REFERENCES[source]);
  if (!match) {
    return null;
  }
  return Number(match[1]);
}

function isSkillProfileAiItem(value: unknown): value is SkillProfileAiItem {
  if (!isRecord(value) || !hasOnlyKeys(value, SKILL_PROFILE_AI_ITEM_KEYS)) {
    return false;
  }
  return (
    typeof value.sourceSkill === "string" &&
    typeof value.canonicalSkill === "string" &&
    typeof value.category === "string" &&
    isProfessionalWeight(value.professionalWeight) &&
    isJobRelevance(value.jobRelevance) &&
    Array.isArray(value.evidence) &&
    value.evidence.every(isSkillEvidence)
  );
}

export function isSkillProfileAiOutput(
  value: unknown,
): value is SkillProfileAiOutput {
  if (!isRecord(value) || !hasOnlyKeys(value, ["skills"])) {
    return false;
  }
  return (
    Array.isArray(value.skills) && value.skills.every(isSkillProfileAiItem)
  );
}

function isSkillProfileItem(value: unknown): value is SkillProfileItem {
  if (!isRecord(value) || !hasOnlyKeys(value, SKILL_PROFILE_ITEM_KEYS)) {
    return false;
  }
  return (
    typeof value.sourceSkill === "string" &&
    typeof value.canonicalSkill === "string" &&
    typeof value.category === "string" &&
    isProfessionalWeight(value.professionalWeight) &&
    isJobRelevance(value.jobRelevance) &&
    Number.isInteger(value.priority) &&
    (value.priority as number) >= 1 &&
    Array.isArray(value.evidence) &&
    value.evidence.every(isSkillEvidence)
  );
}

export function isSkillProfile(value: unknown): value is SkillProfile {
  if (!isRecord(value) || !hasOnlyKeys(value, ["skills"])) {
    return false;
  }
  return Array.isArray(value.skills) && value.skills.every(isSkillProfileItem);
}

const INSTRUCTION_LIKE_CATEGORY = [
  /(?:^|[^A-Za-z])system:/i,
  /(?:^|[^A-Za-z])developer:/i,
  /ignore previous/i,
  /```/,
];

export function isValidSkillCategory(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const category = value.trim();
  if (category.length === 0) {
    return false;
  }
  if (Array.from(category).length > 80) {
    return false;
  }
  if (/\p{Cc}/u.test(category)) {
    return false;
  }
  return !INSTRUCTION_LIKE_CATEGORY.some((marker) => marker.test(category));
}
