import type { OptimizedCv, OptimizedCvSkillGroup } from "../types/optimized-cv";

function skillComparisonKey(skill: string): string {
  return skill.trim().toLowerCase();
}

function isNonEmptySkill(value: string): boolean {
  return value.trim() !== "";
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
    skills: [
      ...reconciledGroups.flatMap((group) => group.skills),
      ...additionalSkills,
    ],
    skillGroups: reconciledGroups,
  };
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

export function applyOptimizedCvSkillEdits(
  cv: OptimizedCv,
  skills: readonly string[],
): OptimizedCv {
  if (cv.skillGroups === undefined) {
    return { ...cv, skills: [...skills] };
  }

  const reconciled = reconcileOptimizedCvSkills(skills, cv.skillGroups);
  return {
    ...cv,
    skills: reconciled.skills,
    skillGroups: reconciled.skillGroups,
  };
}
