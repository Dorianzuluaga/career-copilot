import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MasterCvInput } from "../types/master-cv.js";
import type {
  SkillIntelligenceInput,
  SkillProfile,
  SkillProfileAiItem,
} from "../types/skill-intelligence.js";
import {
  buildSkillIntelligenceSourceFingerprint,
  buildSkillProfile,
  masterCvSkillComparisonKey,
} from "./skill-intelligence.js";

const { generateSkillProfile } = vi.hoisted(() => ({
  generateSkillProfile: vi.fn(),
}));

vi.mock("./skill-intelligence-ai.service.js", () => ({
  generateSkillProfile,
}));

import {
  buildSkillProfileCacheIdentity,
  clearSkillProfileCache,
  getOrComputeSkillProfile,
  skillProfileCacheKey,
} from "./skill-intelligence-cache.js";

const servicesRoot = fileURLToPath(new URL("./", import.meta.url));
const apiRoot = fileURLToPath(new URL("../../", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));

function readSource(relativePath: string, root = servicesRoot) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function walkFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function masterCv(overrides: Partial<MasterCvInput> = {}): MasterCvInput {
  return {
    fullName: "Taylor Smith",
    professionalTitle: "Software Engineer",
    email: "taylor@example.com",
    phone: "+1 555 0100",
    location: "Berlin",
    linkedin: "https://linkedin.com/in/taylor",
    website: "https://example.com",
    professionalSummary: "Software engineer",
    experience: [
      {
        jobTitle: "Software Engineer",
        company: "Example",
        location: "Berlin",
        startDate: "2020-01",
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
    skills: ["React", "TypeScript", "Git"],
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

function skillIntelligenceInput(
  overrides: Partial<SkillIntelligenceInput> = {},
): SkillIntelligenceInput {
  return {
    masterCv: masterCv(),
    jobAnalysis: {
      requiredSkills: ["React", "TypeScript", "REST APIs"],
      atsKeywords: ["React", "REST"],
      responsibilities: ["Build interfaces"],
      summary: "Frontend engineer for product teams.",
    },
    profileMatch: {
      matchingSkills: ["React", "Kubernetes"],
      missingSkills: ["REST APIs", "Go"],
      strengths: ["Strong React experience for the role."],
      weaknesses: ["REST APIs are not demonstrated."],
      alignmentScore: 74,
      alignmentReasoning: "Core frontend skills are supported.",
      recommendation: "Continue after strengthening API evidence.",
    },
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

const profile: SkillProfile = {
  skills: [
    {
      sourceSkill: "React",
      canonicalSkill: "React",
      category: "Front-End",
      professionalWeight: "core_professional",
      jobRelevance: "very_high",
      priority: 1,
      evidence: [],
    },
    {
      sourceSkill: "TypeScript",
      canonicalSkill: "TS",
      category: "Front-End",
      professionalWeight: "core_professional",
      jobRelevance: "high",
      priority: 2,
      evidence: [],
    },
    {
      sourceSkill: "Git",
      canonicalSkill: "Git",
      category: "Development Tools",
      professionalWeight: "general",
      jobRelevance: "none",
      priority: 3,
      evidence: [],
    },
  ],
};

describe("Skill Intelligence Phase 6 isolation", () => {
  it("does not persist a Skill Profile in Prisma", () => {
    const schema = readSource("prisma/schema.prisma", apiRoot);
    expect(schema).not.toMatch(/SkillProfile|skill_profile|skillIntelligence/i);
    expect(schema).toContain("model ProfileMatch");
    expect(schema).toContain("model OptimizedCv");
    expect(schema).toContain("model CoverLetter");
  });

  it("does not expose a public Skill Intelligence HTTP API", () => {
    const app = readSource("src/app.ts", apiRoot);
    const applicationRoutes = readSource("src/routes/application.routes.ts", apiRoot);
    const authRoutes = readSource("src/routes/auth.routes.ts", apiRoot);
    const masterCvRoutes = readSource("src/routes/master-cv.routes.ts", apiRoot);
    const combined = [app, applicationRoutes, authRoutes, masterCvRoutes].join(
      "\n",
    );

    expect(combined).not.toMatch(/skill-intelligence|skillProfile|skill-profile/i);
    expect(applicationRoutes).toContain('applicationRouter.post("/:id/optimized-cv"');
    expect(applicationRoutes).toContain('applicationRouter.post("/:id/cover-letter"');
    expect(applicationRoutes).not.toContain("skill-intelligence");
  });

  it("does not add LangGraph, RAG, MCP, or multi-agent orchestration dependencies", () => {
    const manifests = [
      readSource("package.json", repoRoot),
      readSource("package.json", apiRoot),
      readSource("apps/web/package.json", repoRoot),
    ].join("\n");

    expect(manifests).not.toMatch(/langgraph|langchain|@modelcontextprotocol|\bmcp\b/i);
  });

  it("does not implement a frontend Skill Intelligence cache or types", () => {
    const webSrc = path.join(repoRoot, "apps/web/src");
    const webFiles = walkFiles(webSrc).filter((file) =>
      /\.(ts|tsx)$/.test(file),
    );
    const haystack = webFiles.map((file) => readFileSync(file, "utf8")).join("\n");

    expect(haystack).not.toMatch(/skill-intelligence|skillProfile|canonicalSkill/);
    expect(webFiles.some((file) => file.includes("skill-intelligence"))).toBe(
      false,
    );
  });

  it("keeps Skill Intelligence locale-independent and Profile Match regeneration out of SI", () => {
    const intelligence = readSource("skill-intelligence.ts");
    const ai = readSource("skill-intelligence-ai.service.ts");
    const cache = readSource("skill-intelligence-cache.ts");

    for (const source of [intelligence, ai, cache]) {
      expect(source).not.toContain("generationLanguageInstruction");
      expect(source).not.toContain("compareProfiles");
      expect(source).not.toContain("comparePreparedProfiles");
      expect(source).not.toContain("presentProfileMatch");
      expect(source).not.toContain("upsertProfileMatch");
      expect(source).not.toContain("identifyMatchingSkills");
      expect(source).not.toContain("profile-match-presentation");
      expect(source).not.toContain("profile-match-adaptation");
    }

    expect(ai).toContain("Skill Intelligence is locale-independent.");
    expect(intelligence).toContain(".toLowerCase()");
    expect(intelligence).not.toContain("toLocaleLowerCase");
  });

  it("does not couple export, document language, or Profile Match presentation to Skill Intelligence", () => {
    const exportService = readSource("export.service.ts");
    const exportPresentation = readSource("export-presentation.service.ts");
    const exportAdaptation = readSource("export-adaptation.service.ts");
    const documentLocalization = readSource(
      "../documents/document-localization.ts",
    );
    const profileMatchPresentation = readSource(
      "profile-match-presentation.service.ts",
    );
    const profileComparison = readSource("profile-comparison.service.ts");

    for (const source of [
      exportService,
      exportPresentation,
      exportAdaptation,
      documentLocalization,
      profileMatchPresentation,
      profileComparison,
    ]) {
      expect(source).not.toContain("skill-intelligence");
      expect(source).not.toContain("getOrComputeSkillProfile");
      expect(source).not.toContain("generateSkillProfile");
    }
  });

  it("keeps Cover Letter optional for Optimized CV generation and export navigation", () => {
    const optimizedCv = readSource("optimized-cv.service.ts");
    const navigation = readSource(
      "apps/web/src/components/WorkspaceNavigation.tsx",
      repoRoot,
    );

    expect(optimizedCv).not.toContain("cover-letter");
    expect(optimizedCv).not.toContain("generateCoverLetter");
    expect(optimizedCv).not.toContain("getCoverLetter");
    expect(navigation).toContain(
      "const isExportAvailable = isOptimizedCvCompleted;",
    );
    expect(navigation).toContain(
      "const isCoverLetterAvailable = isOptimizedCvCompleted;",
    );
  });

  it("does not duplicate Skill Intelligence validation or priority assignment in document generators", () => {
    const optimizedCvAi = readSource("optimized-cv-ai.service.ts");
    const coverLetterAi = readSource("cover-letter-ai.service.ts");
    const optimizedCv = readSource("optimized-cv.service.ts");
    const coverLetter = readSource("cover-letter.service.ts");

    expect(optimizedCv).toContain("getOrComputeSkillProfile");
    expect(coverLetter).toContain("getOrComputeSkillProfile");
    expect(optimizedCvAi).toContain("assembleOptimizedCvSkillsFromProfile");
    expect(optimizedCvAi).not.toContain("assignSkillPriorities");
    expect(optimizedCvAi).not.toContain("buildSkillProfile");
    expect(optimizedCvAi).not.toContain("buildMasterCvSkillInventory");
    expect(coverLetterAi).not.toContain("assignSkillPriorities");
    expect(coverLetterAi).not.toContain("buildMasterCvSkillInventory");
    expect(coverLetterAi).not.toContain("buildSkillProfile");
  });
});

describe("shared Skill Profile between Optimized CV and Cover Letter", () => {
  beforeEach(() => {
    clearSkillProfileCache();
    generateSkillProfile.mockReset();
    generateSkillProfile.mockImplementation(async () => structuredClone(profile));
  });

  it("uses the same cache identity for both generators, independent of document locale", async () => {
    const input = skillIntelligenceInput();
    const identity = buildSkillProfileCacheIdentity(
      "user-1",
      "application-1",
      input,
    );

    expect(identity).toEqual({
      userId: "user-1",
      applicationId: "application-1",
      sourceFingerprint: identity.sourceFingerprint,
      skillProfileContractVersion: 1,
    });
    expect(identity).not.toHaveProperty("locale");
    expect(identity).not.toHaveProperty("workingLanguage");
    expect(JSON.stringify(identity)).not.toContain("es");
    expect(JSON.stringify(identity)).not.toContain("fr");

    const fromOptimizedCv = await getOrComputeSkillProfile({
      userId: "user-1",
      applicationId: "application-1",
      input,
    });
    const fromCoverLetter = await getOrComputeSkillProfile({
      userId: "user-1",
      applicationId: "application-1",
      input,
    });

    expect(generateSkillProfile).toHaveBeenCalledOnce();
    expect(fromCoverLetter).toEqual(fromOptimizedCv);
    expect(fromCoverLetter).toEqual(profile);
    expect(skillProfileCacheKey(identity)).toBe(
      skillProfileCacheKey(
        buildSkillProfileCacheIdentity("user-1", "application-1", input),
      ),
    );
  });

  it("does not change cache identity when excluded Profile Match locale or Job Analysis fields differ", () => {
    const input = skillIntelligenceInput();
    const baseline = buildSkillIntelligenceSourceFingerprint(input);

    expect(
      buildSkillIntelligenceSourceFingerprint({
        ...input,
        jobAnalysis: {
          ...input.jobAnalysis,
          title: "Changed title",
          company: "Changed company",
        } as SkillIntelligenceInput["jobAnalysis"],
        profileMatch: {
          ...input.profileMatch,
          workingLanguage: "es",
        } as SkillIntelligenceInput["profileMatch"],
      }),
    ).toBe(baseline);
    expect(
      buildSkillIntelligenceSourceFingerprint({
        ...input,
        masterCv: {
          ...input.masterCv,
          skills: [...input.masterCv.skills, "User Edited Optimized CV Skill"],
        },
      }),
    ).not.toBe(baseline);
  });
});

describe("Master CV remains the only candidate skill inventory", () => {
  it("rejects Profile Match matchingSkills copied into sourceSkill", () => {
    expect(() =>
      buildSkillProfile(
        {
          skills: [
            aiItem({ sourceSkill: "React" }),
            aiItem({ sourceSkill: "TypeScript" }),
            aiItem({ sourceSkill: "Git" }),
            aiItem({ sourceSkill: "Kubernetes" }),
          ],
        },
        masterCv(),
      ),
    ).toThrow(/not in the Master CV inventory/);
  });

  it("rejects Profile Match missingSkills and Job Analysis requiredSkills as candidate skills", () => {
    expect(() =>
      buildSkillProfile(
        {
          skills: [
            aiItem({ sourceSkill: "React" }),
            aiItem({ sourceSkill: "TypeScript" }),
            aiItem({ sourceSkill: "Git" }),
            aiItem({ sourceSkill: "Go" }),
          ],
        },
        masterCv(),
      ),
    ).toThrow(/not in the Master CV inventory/);

    expect(() =>
      buildSkillProfile(
        {
          skills: [
            aiItem({ sourceSkill: "React" }),
            aiItem({ sourceSkill: "TypeScript" }),
            aiItem({ sourceSkill: "Git" }),
            aiItem({ sourceSkill: "REST APIs" }),
          ],
        },
        masterCv(),
      ),
    ).toThrow(/not in the Master CV inventory/);
  });

  it("keeps jobRelevance none in the Skill Profile without inventing Job Analysis skills", () => {
    const result = buildSkillProfile(
      {
        skills: [
          aiItem({
            sourceSkill: "React",
            professionalWeight: "core_professional",
            jobRelevance: "very_high",
          }),
          aiItem({
            sourceSkill: "TypeScript",
            professionalWeight: "core_professional",
            jobRelevance: "high",
          }),
          aiItem({
            sourceSkill: "Git",
            canonicalSkill: "Git SCM",
            category: "Development Tools",
            professionalWeight: "general",
            jobRelevance: "none",
          }),
        ],
      },
      masterCv(),
    );

    expect(result.skills.map((item) => item.sourceSkill)).toEqual([
      "React",
      "TypeScript",
      "Git",
    ]);
    expect(result.skills.at(-1)).toMatchObject({
      sourceSkill: "Git",
      canonicalSkill: "Git SCM",
      jobRelevance: "none",
      priority: 3,
    });
    expect(result.skills.some((item) => item.sourceSkill === "REST APIs")).toBe(
      false,
    );
    expect(result.skills.some((item) => item.sourceSkill === "Kubernetes")).toBe(
      false,
    );
  });

  it("uses locale-independent comparison keys rather than the active locale", () => {
    expect(masterCvSkillComparisonKey("I")).toBe("i");
    expect(masterCvSkillComparisonKey("I")).not.toBe("ı");
    expect(masterCvSkillComparisonKey("  React  ")).toBe("react");
    expect(masterCvSkillComparisonKey("REACT")).toBe(
      masterCvSkillComparisonKey("react"),
    );
  });
});
