import { describe, expect, it } from "vitest";
import type { SkillProfile } from "../types/skill-intelligence.js";
import {
  additionalSkillsWithoutInventedCategories,
  assembleOptimizedCvSkillsFromProfile,
  encodePersistedOptimizedCvSkills,
  flattenOptimizedCvSkillGroups,
  parsePersistedOptimizedCvSkills,
  presentOptimizedCvSkills,
  readOptimizedCvSkillFields,
  reconcileOptimizedCvSkills,
} from "./optimized-cv-skills.js";

const skillProfile: SkillProfile = {
  skills: [
    {
      sourceSkill: "React",
      canonicalSkill: "React.js",
      category: "Front-End",
      professionalWeight: "core_professional",
      jobRelevance: "very_high",
      priority: 1,
      evidence: [],
    },
    {
      sourceSkill: "Node.js",
      canonicalSkill: "Node",
      category: "Back-End",
      professionalWeight: "core_professional",
      jobRelevance: "very_high",
      priority: 2,
      evidence: [],
    },
    {
      sourceSkill: "TypeScript",
      canonicalSkill: "TS",
      category: "Front-End",
      professionalWeight: "core_professional",
      jobRelevance: "high",
      priority: 3,
      evidence: [],
    },
    {
      sourceSkill: "Git",
      canonicalSkill: "Git SCM",
      category: "Development Tools",
      professionalWeight: "general",
      jobRelevance: "none",
      priority: 4,
      evidence: [],
    },
    {
      sourceSkill: "PostgreSQL",
      canonicalSkill: "Postgres",
      category: "Back-End",
      professionalWeight: "supporting",
      jobRelevance: "low",
      priority: 5,
      evidence: [],
    },
  ],
};

const masterSkills = ["React", "Node.js", "TypeScript", "Git", "PostgreSQL"];

const expectedGroups = [
  { category: "Front-End", skills: ["React", "TypeScript"] },
  { category: "Back-End", skills: ["Node.js", "PostgreSQL"] },
  { category: "Development Tools", skills: ["Git"] },
];

describe("assembleOptimizedCvSkillsFromProfile", () => {
  it("keeps every Master CV skill in the grouped Skills representation", () => {
    const assembled = assembleOptimizedCvSkillsFromProfile(
      masterSkills,
      skillProfile,
    );

    expect(assembled.skills).toEqual([
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Git",
    ]);
    expect(assembled.skillGroups.flatMap((group) => group.skills)).toEqual(
      assembled.skills,
    );
  });

  it("does not remove a skill because jobRelevance is low or none", () => {
    const assembled = assembleOptimizedCvSkillsFromProfile(
      masterSkills,
      skillProfile,
    );

    expect(assembled.skills).toEqual(
      expect.arrayContaining(["PostgreSQL", "Git"]),
    );
    expect(
      assembled.skillGroups.find((group) => group.category === "Back-End")
        ?.skills,
    ).toContain("PostgreSQL");
    expect(
      assembled.skillGroups.find(
        (group) => group.category === "Development Tools",
      )?.skills,
    ).toContain("Git");
  });

  it("does not remove a skill because of Skill Profile priority", () => {
    const assembled = assembleOptimizedCvSkillsFromProfile(
      masterSkills,
      skillProfile,
    );

    expect(assembled.skills).toHaveLength(masterSkills.length);
    expect(assembled.skills).toEqual(
      expect.arrayContaining([
        "React",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
        "Git",
      ]),
    );
    expect(assembled.skillGroups.flatMap((group) => group.skills)).toHaveLength(
      masterSkills.length,
    );
  });

  it("preserves Skill Profile categories", () => {
    expect(
      assembleOptimizedCvSkillsFromProfile(masterSkills, skillProfile)
        .skillGroups,
    ).toEqual(expectedGroups);
  });

  it("preserves sourceSkill as the document-facing value", () => {
    const assembled = assembleOptimizedCvSkillsFromProfile(
      masterSkills,
      skillProfile,
    );

    expect(assembled.skills).toEqual([
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Git",
    ]);
    expect(assembled.skillGroups.flatMap((group) => group.skills)).toEqual([
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Git",
    ]);
  });

  it("never uses canonicalSkill as a document-facing value", () => {
    const assembled = assembleOptimizedCvSkillsFromProfile(
      masterSkills,
      skillProfile,
    );
    const documentFacing = [
      ...assembled.skills,
      ...assembled.skillGroups.flatMap((group) => [
        group.category,
        ...group.skills,
      ]),
    ];

    expect(documentFacing).not.toContain("React.js");
    expect(documentFacing).not.toContain("Node");
    expect(documentFacing).not.toContain("TS");
    expect(documentFacing).not.toContain("Git SCM");
    expect(documentFacing).not.toContain("Postgres");
  });

  it("does not invent categories for Master CV skills absent from the Skill Profile", () => {
    const assembled = assembleOptimizedCvSkillsFromProfile(
      [...masterSkills, "Excel"],
      skillProfile,
    );

    expect(assembled.skills).toContain("Excel");
    expect(
      assembled.skillGroups.some((group) => group.skills.includes("Excel")),
    ).toBe(false);
    expect(
      additionalSkillsWithoutInventedCategories(
        assembled.skills,
        assembled.skillGroups,
      ),
    ).toEqual(["Excel"]);
  });
});

describe("parsePersistedOptimizedCvSkills", () => {
  it("loads legacy string[] Optimized CV skills without grouping", () => {
    expect(parsePersistedOptimizedCvSkills(["TypeScript", "React"])).toEqual({
      skills: ["TypeScript", "React"],
    });
  });

  it("loads persisted grouped skills into category → sourceSkill lists", () => {
    expect(
      parsePersistedOptimizedCvSkills({
        groups: expectedGroups,
        additionalSkills: ["Excel"],
      }),
    ).toEqual({
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Git", "Excel"],
      skillGroups: expectedGroups,
    });
  });
});

describe("encodePersistedOptimizedCvSkills", () => {
  it("persists legacy documents as string[]", () => {
    expect(
      encodePersistedOptimizedCvSkills(["TypeScript", "React"], undefined),
    ).toEqual(["TypeScript", "React"]);
  });

  it("persists grouping without inventing categories for user-added skills", () => {
    expect(
      encodePersistedOptimizedCvSkills(
        flattenOptimizedCvSkillGroups(expectedGroups, ["Excel"]),
        expectedGroups,
      ),
    ).toEqual({
      groups: expectedGroups,
      additionalSkills: ["Excel"],
    });
  });
});

describe("reconcileOptimizedCvSkills", () => {
  it("keeps user-added skills uncategorized", () => {
    const reconciled = reconcileOptimizedCvSkills(
      ["React", "TypeScript", "Node.js", "PostgreSQL", "Git", "Excel"],
      expectedGroups,
    );

    expect(reconciled.skillGroups).toEqual(expectedGroups);
    expect(reconciled.skills.at(-1)).toBe("Excel");
    expect(
      additionalSkillsWithoutInventedCategories(
        reconciled.skills,
        reconciled.skillGroups,
      ),
    ).toEqual(["Excel"]);
  });

  it("removes a grouped skill without inventing categories for remaining additions", () => {
    const reconciled = reconcileOptimizedCvSkills(
      ["TypeScript", "Node.js", "PostgreSQL", "Git", "Excel"],
      expectedGroups,
    );

    expect(reconciled.skillGroups).toEqual([
      { category: "Front-End", skills: ["TypeScript"] },
      { category: "Back-End", skills: ["Node.js", "PostgreSQL"] },
      { category: "Development Tools", skills: ["Git"] },
    ]);
    expect(
      additionalSkillsWithoutInventedCategories(
        reconciled.skills,
        reconciled.skillGroups,
      ),
    ).toEqual(["Excel"]);
  });
});

describe("readOptimizedCvSkillFields", () => {
  it("round-trips public skillGroups on save payloads", () => {
    expect(
      readOptimizedCvSkillFields({
        skills: ["React", "TypeScript", "Excel"],
        skillGroups: [
          { category: "Front-End", skills: ["React", "TypeScript"] },
        ],
      }),
    ).toEqual({
      skills: ["React", "TypeScript", "Excel"],
      skillGroups: [{ category: "Front-End", skills: ["React", "TypeScript"] }],
    });
  });

  it("rejects invalid skill grouping metadata", () => {
    expect(() =>
      readOptimizedCvSkillFields({
        skills: ["React"],
        skillGroups: [{ category: "", skills: ["React"] }],
      }),
    ).toThrowError(/skill grouping is invalid/i);
  });
});

describe("presentOptimizedCvSkills", () => {
  it("renders persisted Skill Profile categories and sourceSkill values", () => {
    expect(
      presentOptimizedCvSkills(
        flattenOptimizedCvSkillGroups(expectedGroups),
        expectedGroups,
      ),
    ).toEqual({
      mode: "grouped",
      groups: expectedGroups,
      additionalSkills: [],
    });
  });

  it("never presents canonicalSkill", () => {
    const presentation = presentOptimizedCvSkills(
      flattenOptimizedCvSkillGroups(expectedGroups),
      expectedGroups,
    );

    expect(presentation).toEqual({
      mode: "grouped",
      groups: expectedGroups,
      additionalSkills: [],
    });
    expect(JSON.stringify(presentation)).not.toContain("React.js");
    expect(JSON.stringify(presentation)).not.toContain("Git SCM");
  });

  it("preserves category and skill order without filtering", () => {
    const presentation = presentOptimizedCvSkills(
      flattenOptimizedCvSkillGroups(expectedGroups),
      expectedGroups,
    );

    expect(presentation.mode).toBe("grouped");
    if (presentation.mode !== "grouped") {
      return;
    }
    expect(presentation.groups.map((group) => group.category)).toEqual([
      "Front-End",
      "Back-End",
      "Development Tools",
    ]);
    expect(presentation.groups[0]?.skills).toEqual(["React", "TypeScript"]);
    expect(presentation.groups.flatMap((group) => group.skills)).toEqual([
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Git",
    ]);
  });

  it("renders user-added skills after grouped inventory without inventing categories", () => {
    expect(
      presentOptimizedCvSkills(
        flattenOptimizedCvSkillGroups(expectedGroups, ["Excel"]),
        expectedGroups,
      ),
    ).toEqual({
      mode: "grouped",
      groups: expectedGroups,
      additionalSkills: ["Excel"],
    });
  });

  it("renders legacy string[] skills as a flat list", () => {
    expect(presentOptimizedCvSkills(["TypeScript", "React"])).toEqual({
      mode: "flat",
      skills: ["TypeScript", "React"],
    });
  });
});
