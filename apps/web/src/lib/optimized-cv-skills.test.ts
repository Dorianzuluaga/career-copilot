import { describe, expect, it } from "vitest";
import type { OptimizedCv } from "../types/optimized-cv";
import {
  additionalSkillsWithoutInventedCategories,
  applyOptimizedCvSkillEdits,
  presentOptimizedCvSkills,
  reconcileOptimizedCvSkills,
} from "./optimized-cv-skills";

const groupedCv: OptimizedCv = {
  fullName: "Taylor Smith",
  professionalTitle: null,
  email: "taylor@example.com",
  phone: null,
  location: null,
  linkedin: null,
  website: null,
  professionalSummary: "Engineer building APIs.",
  experience: [],
  education: [],
  skills: ["React", "TypeScript", "Node.js", "Excel"],
  skillGroups: [
    { category: "Frontend", skills: ["React", "TypeScript"] },
    { category: "Backend", skills: ["Node.js"] },
  ],
  languages: [],
  certifications: [],
  personalProjects: [],
  workingLanguage: "en",
};

describe("presentOptimizedCvSkills", () => {
  it("renders grouped categories and sourceSkill values in document order", () => {
    expect(
      presentOptimizedCvSkills(groupedCv.skills, groupedCv.skillGroups),
    ).toEqual({
      mode: "grouped",
      groups: groupedCv.skillGroups,
      additionalSkills: ["Excel"],
    });
  });

  it("renders legacy flat skills when grouping metadata is absent", () => {
    expect(presentOptimizedCvSkills(["TypeScript", "React"])).toEqual({
      mode: "flat",
      skills: ["TypeScript", "React"],
    });
  });
});

describe("applyOptimizedCvSkillEdits", () => {
  it("preserves skillGroups when the inventory is unchanged", () => {
    const next = applyOptimizedCvSkillEdits(groupedCv, groupedCv.skills);

    expect(next.skillGroups).toEqual(groupedCv.skillGroups);
    expect(next.skills).toEqual(groupedCv.skills);
  });

  it("adds user skills without inventing categories", () => {
    const next = applyOptimizedCvSkillEdits(groupedCv, [
      ...groupedCv.skills,
      "Figma",
    ]);

    expect(next.skillGroups).toEqual(groupedCv.skillGroups);
    expect(next.skills).toEqual([...groupedCv.skills, "Figma"]);
    expect(
      additionalSkillsWithoutInventedCategories(
        next.skills,
        next.skillGroups ?? [],
      ),
    ).toEqual(["Excel", "Figma"]);
  });

  it("removes a grouped skill without corrupting remaining groups", () => {
    const next = applyOptimizedCvSkillEdits(
      groupedCv,
      groupedCv.skills.filter((skill) => skill !== "React"),
    );

    expect(next.skillGroups).toEqual([
      { category: "Frontend", skills: ["TypeScript"] },
      { category: "Backend", skills: ["Node.js"] },
    ]);
    expect(next.skills).toEqual(["TypeScript", "Node.js", "Excel"]);
    expect(
      reconcileOptimizedCvSkills(next.skills, next.skillGroups ?? []),
    ).toEqual({
      skills: next.skills,
      skillGroups: next.skillGroups,
    });
  });

  it("leaves legacy documents as a flat skill list", () => {
    const legacy: OptimizedCv = {
      ...groupedCv,
      skills: ["TypeScript", "React"],
      skillGroups: undefined,
    };

    expect(
      applyOptimizedCvSkillEdits(legacy, [...legacy.skills, "Excel"]),
    ).toEqual({
      ...legacy,
      skills: ["TypeScript", "React", "Excel"],
    });
  });
});
