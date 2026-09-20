import {
  SKILL_PROFILE_CONTRACT_VERSION,
  type SkillIntelligenceInput,
  type SkillProfile,
  type SkillProfileCacheIdentity,
} from "../types/skill-intelligence.js";
import { generateSkillProfile } from "./skill-intelligence-ai.service.js";
import { buildSkillIntelligenceSourceFingerprint } from "./skill-intelligence.js";

const skillProfileCache = new Map<string, SkillProfile>();

export function clearSkillProfileCache(): void {
  skillProfileCache.clear();
}

export function skillProfileCacheKey(
  identity: SkillProfileCacheIdentity,
): string {
  return JSON.stringify([
    identity.userId,
    identity.applicationId,
    identity.sourceFingerprint,
    identity.skillProfileContractVersion,
  ]);
}

export function buildSkillProfileCacheIdentity(
  userId: string,
  applicationId: string,
  input: SkillIntelligenceInput,
): SkillProfileCacheIdentity {
  return {
    userId,
    applicationId,
    sourceFingerprint: buildSkillIntelligenceSourceFingerprint(input),
    skillProfileContractVersion: SKILL_PROFILE_CONTRACT_VERSION,
  };
}

export async function getOrComputeSkillProfile(params: {
  userId: string;
  applicationId: string;
  input: SkillIntelligenceInput;
}): Promise<SkillProfile> {
  const identity = buildSkillProfileCacheIdentity(
    params.userId,
    params.applicationId,
    params.input,
  );
  const key = skillProfileCacheKey(identity);
  const cached = skillProfileCache.get(key);
  if (cached) {
    return structuredClone(cached);
  }

  const profile = await generateSkillProfile(params.input);
  skillProfileCache.set(key, structuredClone(profile));
  return profile;
}
