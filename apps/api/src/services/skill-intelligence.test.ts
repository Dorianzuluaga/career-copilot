import { describe, expect, it } from "vitest";
import type { MasterCvInput } from "../types/master-cv.js";
import {
  SKILL_PROFILE_CONTRACT_VERSION,
  type SkillIntelligenceInput,
  type SkillProfileAiItem,
  type SkillProfileAiOutput,
  type SkillProfileItem,
} from "../types/skill-intelligence.js";
import {
  assignSkillPriorities,
  buildMasterCvSkillInventory,
  buildSkillIntelligenceFingerprintSource,
  buildSkillIntelligencePayload,
  buildSkillIntelligenceSourceFingerprint,
  buildSkillProfile,
  canonicalJson,
  masterCvSkillComparisonKey,
  SkillIntelligenceError,
  trimMasterCvSkill,
  validateSkillCategory,
  validateSkillEvidence,
  validateSkillProfile,
} from "./skill-intelligence.js";

function masterCv(overrides: Partial<MasterCvInput> = {}): MasterCvInput {
  return {
    fullName: "Taylor Smith",
    professionalTitle: null,
    email: "taylor@example.com",
    phone: null,
    location: null,
    linkedin: null,
    website: null,
    professionalSummary: "Software engineer",
    experience: [
      {
        jobTitle: "Software Engineer",
        company: "Example",
        location: null,
        startDate: null,
        endDate: null,
        current: true,
        description: "Developed interfaces using React.",
      },
    ],
    education: [
      {
        institution: "Example University",
        degree: "BSc",
        fieldOfStudy: "Computer Science",
        startDate: null,
        endDate: null,
        description: null,
      },
    ],
    skills: ["React", "TypeScript"],
    languages: [{ name: "English", proficiency: "Native" }],
    certifications: [
      { name: "AWS", issuer: "Amazon", issueDate: null, credentialUrl: null },
    ],
    personalProjects: [
      {
        name: "Career Copilot",
        description: "LLM Integration and Prompt Engineering",
        technologies: "TypeScript",
        url: null,
      },
    ],
    ...overrides,
  };
}

function aiItem(
  overrides: Partial<SkillProfileAiItem> &
    Pick<SkillProfileAiItem, "sourceSkill">,
): SkillProfileAiItem {
  return {
    canonicalSkill: overrides.sourceSkill,
    category: "Front-End",
    professionalWeight: "supporting",
    jobRelevance: "medium",
    evidence: [],
    ...overrides,
  };
}

describe("Master CV skill normalization", () => {
  it("trims surrounding whitespace and case-folds only for comparison", () => {
    expect(trimMasterCvSkill("  React  ")).toBe("React");
    expect(masterCvSkillComparisonKey("  React  ")).toBe("react");
    expect(masterCvSkillComparisonKey("REACT")).toBe(
      masterCvSkillComparisonKey("react"),
    );
    expect(masterCvSkillComparisonKey("React")).not.toBe(
      masterCvSkillComparisonKey("React.js"),
    );
  });
});

describe("buildMasterCvSkillInventory", () => {
  it("keeps the first trimmed occurrence and collapses case-only duplicates", () => {
    expect(
      buildMasterCvSkillInventory([
        "React",
        "react",
        "React.js",
        "  ",
        "REACT",
      ]),
    ).toEqual([
      { sourceSkill: "React", originalIndex: 0 },
      { sourceSkill: "React.js", originalIndex: 2 },
    ]);
  });

  it("preserves the original Master CV index of the first distinct skill", () => {
    expect(
      buildMasterCvSkillInventory(["", " TypeScript ", "typescript", "Git"]),
    ).toEqual([
      { sourceSkill: "TypeScript", originalIndex: 1 },
      { sourceSkill: "Git", originalIndex: 3 },
    ]);
  });
});

describe("assignSkillPriorities", () => {
  it("orders by job relevance, then professional weight, then Master CV index", () => {
    const inventory = buildMasterCvSkillInventory([
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Git",
      "LLM Integration",
      "Prompt Engineering",
    ]);
    const items: SkillProfileAiItem[] = [
      aiItem({
        sourceSkill: "Git",
        professionalWeight: "general",
        jobRelevance: "none",
        category: "Development Tools",
      }),
      aiItem({
        sourceSkill: "PostgreSQL",
        professionalWeight: "supporting",
        jobRelevance: "medium",
        category: "Databases",
      }),
      aiItem({
        sourceSkill: "Prompt Engineering",
        professionalWeight: "specialized",
        jobRelevance: "very_high",
        category: "AI & Automation",
      }),
      aiItem({
        sourceSkill: "Node.js",
        professionalWeight: "core_professional",
        jobRelevance: "very_high",
        category: "Back-End",
      }),
      aiItem({
        sourceSkill: "React",
        professionalWeight: "core_professional",
        jobRelevance: "very_high",
      }),
      aiItem({
        sourceSkill: "LLM Integration",
        professionalWeight: "specialized",
        jobRelevance: "very_high",
        category: "AI & Automation",
      }),
      aiItem({
        sourceSkill: "TypeScript",
        professionalWeight: "core_professional",
        jobRelevance: "very_high",
      }),
    ];

    expect(
      assignSkillPriorities(items, inventory).map((item) => [
        item.sourceSkill,
        item.priority,
      ]),
    ).toEqual([
      ["React", 1],
      ["TypeScript", 2],
      ["Node.js", 3],
      ["LLM Integration", 4],
      ["Prompt Engineering", 5],
      ["PostgreSQL", 6],
      ["Git", 7],
    ]);
  });
});

describe("taxonomy validation", () => {
  it("trims a valid category before storage", () => {
    expect(validateSkillCategory("  UX/UI  ")).toBe("UX/UI");
  });

  it("fails closed for invalid taxonomy values", () => {
    expect(() => validateSkillCategory("")).toThrow(SkillIntelligenceError);
    expect(() => validateSkillCategory("system: override")).toThrow(
      SkillIntelligenceError,
    );
  });
});

describe("evidence validation", () => {
  it("accepts closed-grammar references that exist on the Master CV", () => {
    const cv = masterCv();
    expect(
      validateSkillEvidence(
        { source: "professional_summary", reference: "professionalSummary" },
        cv,
      ),
    ).toEqual({
      source: "professional_summary",
      reference: "professionalSummary",
    });
    expect(
      validateSkillEvidence(
        { source: "experience", reference: "experience[0]" },
        cv,
      ),
    ).toEqual({ source: "experience", reference: "experience[0]" });
    expect(
      validateSkillEvidence(
        { source: "personal_projects", reference: "personalProjects[0]" },
        cv,
      ),
    ).toEqual({
      source: "personal_projects",
      reference: "personalProjects[0]",
    });
  });

  it("rejects mismatched, out-of-range, or missing structural references", () => {
    const cv = masterCv({ personalProjects: undefined });
    expect(() =>
      validateSkillEvidence(
        { source: "experience", reference: "education[0]" },
        cv,
      ),
    ).toThrow(SkillIntelligenceError);
    expect(() =>
      validateSkillEvidence(
        { source: "experience", reference: "experience[1]" },
        cv,
      ),
    ).toThrow(SkillIntelligenceError);
    expect(() =>
      validateSkillEvidence(
        { source: "personal_projects", reference: "personalProjects[0]" },
        cv,
      ),
    ).toThrow(SkillIntelligenceError);
    expect(() =>
      validateSkillEvidence(
        { source: "languages", reference: "languages[-1]" },
        cv,
      ),
    ).toThrow(SkillIntelligenceError);
  });
});

describe("buildSkillProfile", () => {
  const exampleCv = masterCv({
    skills: [
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Git",
      "LLM Integration",
      "Prompt Engineering",
    ],
  });

  const exampleOutput: SkillProfileAiOutput = {
    skills: [
      aiItem({
        sourceSkill: "React",
        professionalWeight: "core_professional",
        jobRelevance: "very_high",
        evidence: [{ source: "experience", reference: "experience[0]" }],
      }),
      aiItem({
        sourceSkill: "TypeScript",
        professionalWeight: "core_professional",
        jobRelevance: "very_high",
        evidence: [{ source: "experience", reference: "experience[0]" }],
      }),
      aiItem({
        sourceSkill: "Node.js",
        category: "Back-End",
        professionalWeight: "core_professional",
        jobRelevance: "very_high",
      }),
      aiItem({
        sourceSkill: "LLM Integration",
        category: "AI & Automation",
        professionalWeight: "specialized",
        jobRelevance: "very_high",
        evidence: [
          { source: "personal_projects", reference: "personalProjects[0]" },
        ],
      }),
      aiItem({
        sourceSkill: "Prompt Engineering",
        category: "AI & Automation",
        professionalWeight: "specialized",
        jobRelevance: "very_high",
        evidence: [
          { source: "personal_projects", reference: "personalProjects[0]" },
        ],
      }),
      aiItem({
        sourceSkill: "PostgreSQL",
        category: "Databases",
        professionalWeight: "supporting",
        jobRelevance: "medium",
      }),
      aiItem({
        sourceSkill: "Git",
        category: "Development Tools",
        professionalWeight: "general",
        jobRelevance: "none",
      }),
    ],
  };

  it("assigns deterministic priority and keeps every distinct Master CV skill", () => {
    const profile = buildSkillProfile(exampleOutput, exampleCv);

    expect(profile.skills.map((item) => item.sourceSkill)).toEqual([
      "React",
      "TypeScript",
      "Node.js",
      "LLM Integration",
      "Prompt Engineering",
      "PostgreSQL",
      "Git",
    ]);
    expect(profile.skills.map((item) => item.priority)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(profile.skills.at(-1)).toMatchObject({
      sourceSkill: "Git",
      jobRelevance: "none",
      priority: 7,
      evidence: [],
    });
    expect(validateSkillProfile(profile, exampleCv)).toEqual(profile);
  });

  it("uses the first-seen Master CV string and does not create a duplicate item", () => {
    const cv = masterCv({ skills: ["React", "react", "React.js"] });
    const profile = buildSkillProfile(
      {
        skills: [
          aiItem({ sourceSkill: "React", jobRelevance: "high" }),
          aiItem({
            sourceSkill: "React.js",
            canonicalSkill: "React.js",
            jobRelevance: "medium",
          }),
        ],
      },
      cv,
    );

    expect(profile.skills.map((item) => item.sourceSkill)).toEqual([
      "React",
      "React.js",
    ]);
    expect(profile.skills).toHaveLength(2);
  });

  it("fails closed when the AI rewrites sourceSkill or omits an inventory skill", () => {
    expect(() =>
      buildSkillProfile(
        {
          skills: [
            aiItem({ sourceSkill: "react" }),
            aiItem({ sourceSkill: "TypeScript" }),
          ],
        },
        masterCv(),
      ),
    ).toThrow(/not in the Master CV inventory/);

    expect(() =>
      buildSkillProfile(
        { skills: [aiItem({ sourceSkill: "React" })] },
        masterCv(),
      ),
    ).toThrow(/every distinct Master CV skill/);
  });

  it("rejects invented skills, extra skills, and AI-supplied priority", () => {
    expect(() =>
      buildSkillProfile(
        {
          skills: [
            aiItem({ sourceSkill: "React" }),
            aiItem({ sourceSkill: "TypeScript" }),
            aiItem({ sourceSkill: "REST APIs" }),
          ],
        },
        masterCv(),
      ),
    ).toThrow(/not in the Master CV inventory/);

    expect(() =>
      buildSkillProfile(
        {
          skills: [
            { ...aiItem({ sourceSkill: "React" }), priority: 1 },
            aiItem({ sourceSkill: "TypeScript" }),
          ],
        },
        masterCv(),
      ),
    ).toThrow("Invalid Skill Intelligence response.");
  });

  it("allows empty evidence and near-duplicate category strings", () => {
    const profile = buildSkillProfile(
      {
        skills: [
          aiItem({ sourceSkill: "React", category: "Front-End" }),
          aiItem({ sourceSkill: "TypeScript", category: "Frontend" }),
        ],
      },
      masterCv(),
    );

    expect(profile.skills[0].evidence).toEqual([]);
    expect(profile.skills.map((item) => item.category)).toEqual([
      "Front-End",
      "Frontend",
    ]);
  });

  it("rejects invalid evidence even when the skill inventory is complete", () => {
    expect(() =>
      buildSkillProfile(
        {
          skills: [
            aiItem({
              sourceSkill: "React",
              evidence: [{ source: "experience", reference: "experience[9]" }],
            }),
            aiItem({ sourceSkill: "TypeScript" }),
          ],
        },
        masterCv(),
      ),
    ).toThrow("Skill Profile evidence is invalid.");
  });
});

function skillIntelligenceInput(
  overrides: Partial<SkillIntelligenceInput> = {},
): SkillIntelligenceInput {
  return {
    masterCv: masterCv({
      fullName: "Taylor Smith",
      professionalTitle: "Software Engineer",
      email: "taylor@example.com",
      phone: "+1 555 0100",
      location: "Berlin",
      linkedin: "https://linkedin.com/in/taylor",
      website: "https://example.com",
      skills: ["React", "react", "React.js"],
    }),
    jobAnalysis: {
      requiredSkills: ["React", "TypeScript", "REST APIs"],
      atsKeywords: ["React", "REST"],
      responsibilities: ["Build interfaces"],
      summary: "Frontend engineer for product teams.",
    },
    profileMatch: {
      matchingSkills: ["React"],
      missingSkills: ["REST APIs"],
      strengths: ["Strong React experience for the role."],
      weaknesses: ["REST APIs are not demonstrated."],
      alignmentScore: 74,
      alignmentReasoning: "Core frontend skills are supported.",
      recommendation: "Continue after strengthening API evidence.",
    },
    ...overrides,
  };
}

describe("buildSkillIntelligencePayload", () => {
  it("sends the distinct inventory and curated evidence fields only", () => {
    const input = skillIntelligenceInput();
    const payload = buildSkillIntelligencePayload(input);

    expect(payload.skillInventory).toEqual([
      { sourceSkill: "React", originalIndex: 0 },
      { sourceSkill: "React.js", originalIndex: 2 },
    ]);
    expect(payload.masterCv).toEqual({
      skills: ["React", "React.js"],
      professionalSummary: "Software engineer",
      experience: [
        {
          jobTitle: "Software Engineer",
          company: "Example",
          description: "Developed interfaces using React.",
        },
      ],
      education: [
        {
          degree: "BSc",
          fieldOfStudy: "Computer Science",
          description: null,
        },
      ],
      certifications: [{ name: "AWS", issuer: "Amazon" }],
      languages: [{ name: "English", proficiency: "Native" }],
      personalProjects: [
        {
          name: "Career Copilot",
          description: "LLM Integration and Prompt Engineering",
          technologies: "TypeScript",
        },
      ],
    });
    expect(payload.jobAnalysis).toEqual({
      requiredSkills: ["React", "TypeScript", "REST APIs"],
      atsKeywords: ["React", "REST"],
      responsibilities: ["Build interfaces"],
      summary: "Frontend engineer for product teams.",
    });
    expect(payload.profileMatch).toEqual({
      matchingSkills: ["React"],
      missingSkills: ["REST APIs"],
      strengths: ["Strong React experience for the role."],
      weaknesses: ["REST APIs are not demonstrated."],
      alignmentScore: 74,
      alignmentReasoning: "Core frontend skills are supported.",
      recommendation: "Continue after strengthening API evidence.",
    });
  });

  it("excludes personal, locale, and Optimized CV fields", () => {
    const payload = buildSkillIntelligencePayload(skillIntelligenceInput());
    const serialized = JSON.stringify(payload);

    expect(serialized).not.toContain("taylor@example.com");
    expect(serialized).not.toContain("+1 555 0100");
    expect(serialized).not.toContain("Berlin");
    expect(serialized).not.toContain("linkedin");
    expect(serialized).not.toContain("https://example.com");
    expect(serialized).not.toContain("fullName");
    expect(serialized).not.toContain("professionalTitle");
    expect(serialized).not.toContain("profilePhoto");
    expect(serialized).not.toContain("workingLanguage");
    expect(serialized).not.toContain("optimizedCv");
    expect(payload).not.toHaveProperty("locale");
    expect(payload.masterCv).not.toHaveProperty("email");
    expect(payload.masterCv).not.toHaveProperty("phone");
    expect(payload.masterCv).not.toHaveProperty("location");
    expect(payload.jobAnalysis).not.toHaveProperty("title");
    expect(payload.jobAnalysis).not.toHaveProperty("company");
    expect(payload.profileMatch).not.toHaveProperty("workingLanguage");
  });

  it("uses an empty personalProjects array when the Master CV omits them", () => {
    const payload = buildSkillIntelligencePayload(
      skillIntelligenceInput({
        masterCv: masterCv({ personalProjects: undefined, skills: ["Git"] }),
      }),
    );

    expect(payload.masterCv.personalProjects).toEqual([]);
    expect(payload.masterCv.skills).toEqual(["Git"]);
  });
});

describe("Skill Intelligence source fingerprint", () => {
  it("hashes the curated payload fields and contract version, not personal fields", () => {
    const source = buildSkillIntelligenceFingerprintSource(
      skillIntelligenceInput(),
    );
    const serialized = canonicalJson(source);

    expect(source.skillProfileContractVersion).toBe(
      SKILL_PROFILE_CONTRACT_VERSION,
    );
    expect(SKILL_PROFILE_CONTRACT_VERSION).toBe(1);
    expect(source.masterCv.skills).toEqual(["React", "React.js"]);
    expect(source).not.toHaveProperty("skillInventory");
    expect(serialized).not.toContain("originalIndex");
    expect(serialized).not.toContain("taylor@example.com");
    expect(serialized).not.toContain("+1 555 0100");
    expect(serialized).not.toContain("Berlin");
    expect(serialized).not.toContain("linkedin");
    expect(serialized).not.toContain("fullName");
    expect(serialized).not.toContain("workingLanguage");
    expect(serialized).not.toContain("optimizedCv");
    expect(
      buildSkillIntelligenceSourceFingerprint(skillIntelligenceInput()),
    ).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is stable for the same curated inputs regardless of object key order", () => {
    const source = buildSkillIntelligenceFingerprintSource(
      skillIntelligenceInput(),
    );
    const reordered = {
      skillProfileContractVersion: source.skillProfileContractVersion,
      profileMatch: source.profileMatch,
      jobAnalysis: source.jobAnalysis,
      masterCv: source.masterCv,
    };

    expect(canonicalJson(reordered)).toBe(canonicalJson(source));
    expect(
      buildSkillIntelligenceSourceFingerprint(skillIntelligenceInput()),
    ).toBe(buildSkillIntelligenceSourceFingerprint(skillIntelligenceInput()));
  });

  it("changes when a fingerprint input changes and stays the same when excluded fields change", () => {
    const input = skillIntelligenceInput();
    const baseline = buildSkillIntelligenceSourceFingerprint(input);

    expect(
      buildSkillIntelligenceSourceFingerprint({
        ...input,
        masterCv: {
          ...input.masterCv,
          skills: [...input.masterCv.skills, "Git"],
        },
      }),
    ).not.toBe(baseline);
    expect(
      buildSkillIntelligenceSourceFingerprint({
        ...input,
        masterCv: {
          ...input.masterCv,
          professionalSummary: "Updated professional summary",
        },
      }),
    ).not.toBe(baseline);
    expect(
      buildSkillIntelligenceSourceFingerprint({
        ...input,
        jobAnalysis: {
          ...input.jobAnalysis,
          requiredSkills: ["React"],
        },
      }),
    ).not.toBe(baseline);
    expect(
      buildSkillIntelligenceSourceFingerprint({
        ...input,
        profileMatch: {
          ...input.profileMatch,
          alignmentScore: 10,
        },
      }),
    ).not.toBe(baseline);

    expect(
      buildSkillIntelligenceSourceFingerprint({
        ...input,
        masterCv: {
          ...input.masterCv,
          email: "other@example.com",
          phone: "+1 555 0199",
          location: "Paris",
          linkedin: "https://linkedin.com/in/other",
          website: "https://other.example.com",
          experience: input.masterCv.experience.map((item) => ({
            ...item,
            location: "Paris",
            startDate: "2019-01",
          })),
        },
      }),
    ).toBe(baseline);
  });

  it("changes when the contract version participating in the fingerprint source changes", () => {
    const source = buildSkillIntelligenceFingerprintSource(
      skillIntelligenceInput(),
    );

    expect(
      canonicalJson({
        ...source,
        skillProfileContractVersion: source.skillProfileContractVersion + 1,
      }),
    ).not.toBe(canonicalJson(source));
  });
});

describe("validateSkillProfile", () => {
  it("accepts a complete profile whose priorities match the deterministic algorithm", () => {
    const cv = masterCv();
    const skills: SkillProfileItem[] = [
      {
        ...aiItem({
          sourceSkill: "React",
          professionalWeight: "core_professional",
          jobRelevance: "very_high",
        }),
        priority: 1,
      },
      {
        ...aiItem({ sourceSkill: "TypeScript" }),
        priority: 2,
      },
    ];

    expect(
      validateSkillProfile({ skills }, cv).skills.map((item) => item.priority),
    ).toEqual([1, 2]);
  });

  it("rejects priorities that do not match §11.1", () => {
    const cv = masterCv();
    expect(() =>
      validateSkillProfile(
        {
          skills: [
            {
              ...aiItem({ sourceSkill: "TypeScript", jobRelevance: "none" }),
              priority: 1,
            },
            {
              ...aiItem({
                sourceSkill: "React",
                jobRelevance: "very_high",
              }),
              priority: 2,
            },
          ],
        },
        cv,
      ),
    ).toThrow("Skill Profile priority is invalid.");
  });
});
