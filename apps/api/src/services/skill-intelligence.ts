import { createHash } from "node:crypto";
import type { MasterCvInput } from "../types/master-cv.js";
import {
  evidenceSourceAgreesWithReference,
  isSkillProfile,
  isSkillProfileAiOutput,
  isValidSkillCategory,
  parseIndexedEvidenceReference,
  SKILL_PROFILE_CONTRACT_VERSION,
  type JobRelevance,
  type MasterCvSkillInventoryItem,
  type ProfessionalWeight,
  type SkillEvidence,
  type SkillEvidenceSource,
  type SkillIntelligenceCuratedPayload,
  type SkillIntelligenceFingerprintSource,
  type SkillIntelligenceInput,
  type SkillProfile,
  type SkillProfileAiItem,
  type SkillProfileAiOutput,
  type SkillProfileItem,
} from "../types/skill-intelligence.js";

export class SkillIntelligenceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const JOB_RELEVANCE_RANK: Record<JobRelevance, number> = {
  very_high: 4,
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
};

const PROFESSIONAL_WEIGHT_RANK: Record<ProfessionalWeight, number> = {
  core_professional: 3,
  specialized: 2,
  supporting: 1,
  general: 0,
};

const EVIDENCE_COLLECTIONS = {
  experience: "experience",
  education: "education",
  certifications: "certifications",
  personal_projects: "personalProjects",
  languages: "languages",
} as const satisfies Record<
  Exclude<SkillEvidenceSource, "professional_summary">,
  keyof MasterCvInput
>;

export function trimMasterCvSkill(skill: string): string {
  return skill.trim();
}

export function masterCvSkillComparisonKey(skill: string): string {
  return trimMasterCvSkill(skill).toLowerCase();
}

export function buildMasterCvSkillInventory(
  skills: readonly string[],
): MasterCvSkillInventoryItem[] {
  const inventory: MasterCvSkillInventoryItem[] = [];
  const seen = new Set<string>();

  skills.forEach((skill, originalIndex) => {
    const sourceSkill = trimMasterCvSkill(skill);
    if (!sourceSkill) {
      return;
    }
    const key = masterCvSkillComparisonKey(sourceSkill);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    inventory.push({ sourceSkill, originalIndex });
  });

  return inventory;
}

export function buildSkillIntelligencePayload(
  input: SkillIntelligenceInput,
): SkillIntelligenceCuratedPayload {
  const skillInventory = buildMasterCvSkillInventory(input.masterCv.skills);

  return {
    skillInventory,
    masterCv: {
      skills: skillInventory.map((item) => item.sourceSkill),
      professionalSummary: input.masterCv.professionalSummary,
      experience: input.masterCv.experience.map((item) => ({
        jobTitle: item.jobTitle,
        company: item.company,
        description: item.description,
      })),
      education: input.masterCv.education.map((item) => ({
        degree: item.degree,
        fieldOfStudy: item.fieldOfStudy,
        description: item.description,
      })),
      certifications: input.masterCv.certifications.map((item) => ({
        name: item.name,
        issuer: item.issuer,
      })),
      languages: input.masterCv.languages.map((item) => ({
        name: item.name,
        proficiency: item.proficiency,
      })),
      personalProjects: (input.masterCv.personalProjects ?? []).map((item) => ({
        name: item.name,
        description: item.description,
        technologies: item.technologies,
      })),
    },
    jobAnalysis: {
      requiredSkills: input.jobAnalysis.requiredSkills,
      atsKeywords: input.jobAnalysis.atsKeywords,
      responsibilities: input.jobAnalysis.responsibilities,
      summary: input.jobAnalysis.summary,
    },
    profileMatch: {
      matchingSkills: input.profileMatch.matchingSkills,
      missingSkills: input.profileMatch.missingSkills,
      strengths: input.profileMatch.strengths,
      weaknesses: input.profileMatch.weaknesses,
      alignmentScore: input.profileMatch.alignmentScore,
      alignmentReasoning: input.profileMatch.alignmentReasoning,
      recommendation: input.profileMatch.recommendation,
    },
  };
}

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function canonicalJson(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new SkillIntelligenceError(
        "Skill Intelligence fingerprint source is invalid.",
        502,
      );
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }
  if (isJsonRecord(value)) {
    return `{${Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  throw new SkillIntelligenceError(
    "Skill Intelligence fingerprint source is invalid.",
    502,
  );
}

export function buildSkillIntelligenceFingerprintSource(
  input: SkillIntelligenceInput,
): SkillIntelligenceFingerprintSource {
  const payload = buildSkillIntelligencePayload(input);
  return {
    masterCv: payload.masterCv,
    jobAnalysis: payload.jobAnalysis,
    profileMatch: payload.profileMatch,
    skillProfileContractVersion: SKILL_PROFILE_CONTRACT_VERSION,
  };
}

export function buildSkillIntelligenceSourceFingerprint(
  input: SkillIntelligenceInput,
): string {
  return createHash("sha256")
    .update(canonicalJson(buildSkillIntelligenceFingerprintSource(input)))
    .digest("hex");
}

export function validateSkillCategory(value: unknown): string {
  if (!isValidSkillCategory(value)) {
    throw new SkillIntelligenceError("Skill Profile category is invalid.", 502);
  }
  return value.trim();
}

export function validateSkillEvidence(
  evidence: SkillEvidence,
  masterCv: MasterCvInput,
): SkillEvidence {
  if (!evidenceSourceAgreesWithReference(evidence.source, evidence.reference)) {
    throw new SkillIntelligenceError("Skill Profile evidence is invalid.", 502);
  }

  if (evidence.source === "professional_summary") {
    if (!("professionalSummary" in masterCv)) {
      throw new SkillIntelligenceError(
        "Skill Profile evidence is invalid.",
        502,
      );
    }
    return evidence;
  }

  const index = parseIndexedEvidenceReference(
    evidence.source,
    evidence.reference,
  );
  if (index === null) {
    throw new SkillIntelligenceError("Skill Profile evidence is invalid.", 502);
  }

  const collection = masterCv[EVIDENCE_COLLECTIONS[evidence.source]];
  if (!Array.isArray(collection) || index >= collection.length) {
    throw new SkillIntelligenceError("Skill Profile evidence is invalid.", 502);
  }

  return evidence;
}

function requireSkillProfileAiOutput(value: unknown): SkillProfileAiOutput {
  if (!isSkillProfileAiOutput(value)) {
    throw new SkillIntelligenceError(
      "Invalid Skill Intelligence response.",
      502,
    );
  }
  return value;
}

function requireExactInventoryCoverage(
  sourceSkills: readonly string[],
  inventory: readonly MasterCvSkillInventoryItem[],
): void {
  const inventorySkills = inventory.map((item) => item.sourceSkill);
  const inventorySet = new Set(inventorySkills);
  const seen = new Set<string>();

  for (const sourceSkill of sourceSkills) {
    if (!inventorySet.has(sourceSkill)) {
      throw new SkillIntelligenceError(
        "Skill Profile contains a skill that is not in the Master CV inventory.",
        502,
      );
    }
    if (seen.has(sourceSkill)) {
      throw new SkillIntelligenceError(
        "Skill Profile contains duplicate source skills.",
        502,
      );
    }
    seen.add(sourceSkill);
  }

  if (seen.size !== inventorySet.size) {
    throw new SkillIntelligenceError(
      "Skill Profile must include every distinct Master CV skill.",
      502,
    );
  }
}

function validateAiItemSemantics(
  item: SkillProfileAiItem,
  masterCv: MasterCvInput,
): SkillProfileAiItem {
  return {
    sourceSkill: item.sourceSkill,
    canonicalSkill: item.canonicalSkill,
    category: validateSkillCategory(item.category),
    professionalWeight: item.professionalWeight,
    jobRelevance: item.jobRelevance,
    evidence: item.evidence.map((entry) =>
      validateSkillEvidence(entry, masterCv),
    ),
  };
}

function originalIndexBySourceSkill(
  inventory: readonly MasterCvSkillInventoryItem[],
): Map<string, number> {
  return new Map(
    inventory.map((item) => [item.sourceSkill, item.originalIndex]),
  );
}

function requireOriginalIndex(
  sourceSkill: string,
  originalIndexBySource: Map<string, number>,
): number {
  const originalIndex = originalIndexBySource.get(sourceSkill);
  if (originalIndex === undefined) {
    throw new SkillIntelligenceError(
      "Skill Profile contains a skill that is not in the Master CV inventory.",
      502,
    );
  }
  return originalIndex;
}

function compareSkillPriorityOrder(
  left: Pick<
    SkillProfileAiItem,
    "sourceSkill" | "jobRelevance" | "professionalWeight"
  >,
  right: Pick<
    SkillProfileAiItem,
    "sourceSkill" | "jobRelevance" | "professionalWeight"
  >,
  originalIndexBySource: Map<string, number>,
): number {
  const relevanceDelta =
    JOB_RELEVANCE_RANK[right.jobRelevance] -
    JOB_RELEVANCE_RANK[left.jobRelevance];
  if (relevanceDelta !== 0) {
    return relevanceDelta;
  }

  const weightDelta =
    PROFESSIONAL_WEIGHT_RANK[right.professionalWeight] -
    PROFESSIONAL_WEIGHT_RANK[left.professionalWeight];
  if (weightDelta !== 0) {
    return weightDelta;
  }

  return (
    requireOriginalIndex(left.sourceSkill, originalIndexBySource) -
    requireOriginalIndex(right.sourceSkill, originalIndexBySource)
  );
}

export function assignSkillPriorities(
  items: readonly SkillProfileAiItem[],
  inventory: readonly MasterCvSkillInventoryItem[],
): SkillProfileItem[] {
  const originalIndexBySource = originalIndexBySourceSkill(inventory);

  return [...items]
    .sort((left, right) =>
      compareSkillPriorityOrder(left, right, originalIndexBySource),
    )
    .map((item, index) => ({
      ...item,
      priority: index + 1,
    }));
}

function expectedPriorities(
  items: readonly Pick<
    SkillProfileItem,
    "sourceSkill" | "jobRelevance" | "professionalWeight"
  >[],
  inventory: readonly MasterCvSkillInventoryItem[],
): Map<string, number> {
  const originalIndexBySource = originalIndexBySourceSkill(inventory);
  return new Map(
    [...items]
      .sort((left, right) =>
        compareSkillPriorityOrder(left, right, originalIndexBySource),
      )
      .map((item, index) => [item.sourceSkill, index + 1]),
  );
}

export function buildSkillProfile(
  value: unknown,
  masterCv: MasterCvInput,
): SkillProfile {
  const output = requireSkillProfileAiOutput(value);
  const inventory = buildMasterCvSkillInventory(masterCv.skills);
  requireExactInventoryCoverage(
    output.skills.map((item) => item.sourceSkill),
    inventory,
  );

  const semanticItems = output.skills.map((item) =>
    validateAiItemSemantics(item, masterCv),
  );

  return {
    skills: assignSkillPriorities(semanticItems, inventory),
  };
}

export function validateSkillProfile(
  value: unknown,
  masterCv: MasterCvInput,
): SkillProfile {
  if (!isSkillProfile(value)) {
    throw new SkillIntelligenceError("Skill Profile is invalid.", 502);
  }

  const inventory = buildMasterCvSkillInventory(masterCv.skills);
  requireExactInventoryCoverage(
    value.skills.map((item) => item.sourceSkill),
    inventory,
  );

  const semanticItems = value.skills.map((item) =>
    validateAiItemSemantics(
      {
        sourceSkill: item.sourceSkill,
        canonicalSkill: item.canonicalSkill,
        category: item.category,
        professionalWeight: item.professionalWeight,
        jobRelevance: item.jobRelevance,
        evidence: item.evidence,
      },
      masterCv,
    ),
  );

  const priorities = expectedPriorities(semanticItems, inventory);

  for (const item of value.skills) {
    if (priorities.get(item.sourceSkill) !== item.priority) {
      throw new SkillIntelligenceError(
        "Skill Profile priority is invalid.",
        502,
      );
    }
  }

  return {
    skills: value.skills.map((item, index) => ({
      ...semanticItems[index],
      priority: item.priority,
    })),
  };
}
