import type {
  OptimizedCvPersistedGroupedSkills,
  OptimizedCvSkillGroup,
} from "../types/optimized-cv.js";
import type { SkillProfile } from "../types/skill-intelligence.js";

function skillComparisonKey(skill: string): string {
  return skill.trim().toLowerCase();
}

export class OptimizedCvSkillsError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

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

function isNonEmptySkill(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

export function isOptimizedCvSkillGroup(
  value: unknown,
): value is OptimizedCvSkillGroup {
  if (!isRecord(value) || !hasOnlyKeys(value, ["category", "skills"])) {
    return false;
  }
  return (
    typeof value.category === "string" &&
    value.category.trim() !== "" &&
    Array.isArray(value.skills) &&
    value.skills.every(isNonEmptySkill)
  );
}

export function isPersistedGroupedSkills(
  value: unknown,
): value is OptimizedCvPersistedGroupedSkills {
  if (!isRecord(value) || !hasOnlyKeys(value, ["groups", "additionalSkills"])) {
    return false;
  }
  return (
    Array.isArray(value.groups) &&
    value.groups.every(isOptimizedCvSkillGroup) &&
    Array.isArray(value.additionalSkills) &&
    value.additionalSkills.every(isNonEmptySkill)
  );
}

export function flattenOptimizedCvSkillGroups(
  groups: readonly OptimizedCvSkillGroup[],
  additionalSkills: readonly string[] = [],
): string[] {
  return [...groups.flatMap((group) => group.skills), ...additionalSkills];
}

export function assembleOptimizedCvSkillsFromProfile(
  masterSkills: readonly string[],
  skillProfile: SkillProfile,
): { skills: string[]; skillGroups: OptimizedCvSkillGroup[] } {
  const allowlisted: string[] = [];
  const allowedKeys = new Set<string>();
  for (const skill of masterSkills) {
    const trimmed = skill.trim();
    if (!trimmed) {
      continue;
    }
    const key = skillComparisonKey(trimmed);
    if (allowedKeys.has(key)) {
      continue;
    }
    allowedKeys.add(key);
    allowlisted.push(trimmed);
  }

  const grouped = new Map<string, string[]>();
  const included = new Set<string>();
  const orderedItems = [...skillProfile.skills].sort(
    (left, right) => left.priority - right.priority,
  );

  for (const item of orderedItems) {
    const key = skillComparisonKey(item.sourceSkill);
    if (!allowedKeys.has(key) || included.has(key)) {
      continue;
    }
    const group = grouped.get(item.category);
    if (group) {
      group.push(item.sourceSkill);
    } else {
      grouped.set(item.category, [item.sourceSkill]);
    }
    included.add(key);
  }

  const skillGroups = [...grouped.entries()].map(([category, skills]) => ({
    category,
    skills,
  }));
  const additionalSkills = allowlisted.filter(
    (skill) => !included.has(skillComparisonKey(skill)),
  );

  return {
    skills: flattenOptimizedCvSkillGroups(skillGroups, additionalSkills),
    skillGroups,
  };
}

export function additionalSkillsWithoutInventedCategories(
  skills: readonly string[],
  skillGroups: readonly OptimizedCvSkillGroup[],
): string[] {
  const groupedKeys = new Set(
    skillGroups.flatMap((group) =>
      group.skills.map((skill) => skillComparisonKey(skill)),
    ),
  );
  const seen = new Set<string>();
  const additional: string[] = [];
  for (const skill of skills) {
    const trimmed = skill.trim();
    if (!trimmed) {
      continue;
    }
    const key = skillComparisonKey(trimmed);
    if (groupedKeys.has(key) || seen.has(key)) {
      continue;
    }
    seen.add(key);
    additional.push(trimmed);
  }
  return additional;
}

export function reconcileOptimizedCvSkills(
  skills: readonly string[],
  skillGroups: readonly OptimizedCvSkillGroup[],
): { skills: string[]; skillGroups: OptimizedCvSkillGroup[] } {
  const remainingKeys = new Set(
    skills.flatMap((skill) => {
      const trimmed = skill.trim();
      return trimmed ? [skillComparisonKey(trimmed)] : [];
    }),
  );
  const included = new Set<string>();
  const reconciledGroups: OptimizedCvSkillGroup[] = [];

  for (const group of skillGroups) {
    const groupSkills = group.skills.flatMap((skill) => {
      const trimmed = skill.trim();
      const key = skillComparisonKey(trimmed);
      if (!trimmed || !remainingKeys.has(key) || included.has(key)) {
        return [];
      }
      included.add(key);
      return [trimmed];
    });
    if (groupSkills.length === 0) {
      continue;
    }
    reconciledGroups.push({
      category: group.category.trim(),
      skills: groupSkills,
    });
  }

  const additionalSkills = additionalSkillsWithoutInventedCategories(
    skills,
    reconciledGroups,
  );

  return {
    skills: flattenOptimizedCvSkillGroups(reconciledGroups, additionalSkills),
    skillGroups: reconciledGroups,
  };
}

export function encodePersistedOptimizedCvSkills(
  skills: readonly string[],
  skillGroups: readonly OptimizedCvSkillGroup[] | undefined,
): string[] | OptimizedCvPersistedGroupedSkills {
  if (skillGroups === undefined) {
    return [...skills];
  }
  const reconciled = reconcileOptimizedCvSkills(skills, skillGroups);
  return {
    groups: reconciled.skillGroups.map((group) => ({
      category: group.category,
      skills: [...group.skills],
    })),
    additionalSkills: additionalSkillsWithoutInventedCategories(
      reconciled.skills,
      reconciled.skillGroups,
    ),
  };
}

export function parsePersistedOptimizedCvSkills(value: unknown): {
  skills: unknown;
  skillGroups?: OptimizedCvSkillGroup[];
} {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return { skills: value };
  }
  if (isPersistedGroupedSkills(value)) {
    return {
      skills: flattenOptimizedCvSkillGroups(
        value.groups,
        value.additionalSkills,
      ),
      skillGroups: value.groups,
    };
  }
  return { skills: value };
}

export function readOptimizedCvSkillFields(value: unknown): {
  skills: unknown;
  skillGroups?: OptimizedCvSkillGroup[];
} {
  if (!isRecord(value)) {
    return { skills: undefined };
  }
  const persisted = parsePersistedOptimizedCvSkills(value.skills);
  if (persisted.skillGroups) {
    return persisted;
  }
  if (value.skillGroups === undefined) {
    return { skills: value.skills };
  }
  if (
    !Array.isArray(value.skillGroups) ||
    !value.skillGroups.every(isOptimizedCvSkillGroup)
  ) {
    throw new OptimizedCvSkillsError(
      "The Optimized CV skill grouping is invalid.",
      400,
    );
  }
  if (!Array.isArray(value.skills) || !value.skills.every(isNonEmptySkill)) {
    return { skills: value.skills, skillGroups: value.skillGroups };
  }
  return reconcileOptimizedCvSkills(value.skills, value.skillGroups);
}

export type OptimizedCvSkillsPresentation =
  | { mode: "flat"; skills: string[] }
  | {
      mode: "grouped";
      groups: OptimizedCvSkillGroup[];
      additionalSkills: string[];
    };

export function presentOptimizedCvSkills(
  skills: readonly string[],
  skillGroups?: readonly OptimizedCvSkillGroup[],
): OptimizedCvSkillsPresentation {
  if (skillGroups === undefined) {
    return {
      mode: "flat",
      skills: skills.filter(isNonEmptySkill),
    };
  }

  const reconciled = reconcileOptimizedCvSkills(skills, skillGroups);
  return {
    mode: "grouped",
    groups: reconciled.skillGroups,
    additionalSkills: additionalSkillsWithoutInventedCategories(
      reconciled.skills,
      reconciled.skillGroups,
    ),
  };
}
