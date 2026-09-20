import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { OptimizedCvGenerationInput } from "../types/optimized-cv.js";

const { createResponse } = vi.hoisted(() => ({
  createResponse: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAIMock {
    responses = { create: createResponse };
  },
}));

import {
  enforceMasterCvIntegrity,
  generateOptimizedCvDraft,
} from "./optimized-cv-ai.service.js";

const originalApiKey = process.env.OPENAI_API_KEY;

const input: OptimizedCvGenerationInput = {
  masterCv: {
    fullName: "Taylor Smith",
    professionalTitle: null,
    email: "taylor@example.com",
    phone: null,
    location: "Berlin",
    linkedin: null,
    website: null,
    professionalSummary: "Software engineer building web APIs.",
    experience: [
      {
        jobTitle: "Software Engineer",
        company: "Example",
        location: null,
        startDate: "2020-01",
        endDate: null,
        current: true,
        description: "Built REST APIs with TypeScript.",
      },
    ],
    education: [
      {
        institution: "Example University",
        degree: "BSc",
        fieldOfStudy: "Computer Science",
        startDate: "2016",
        endDate: "2020",
        description: "Studied software engineering.",
      },
    ],
    skills: ["TypeScript", "REST APIs", "PostgreSQL"],
    languages: [{ name: "English", proficiency: "Fluent" }],
    certifications: [
      {
        name: "AWS Cloud Practitioner",
        issuer: "Amazon",
        issueDate: "2022",
        credentialUrl: null,
      },
    ],
    personalProjects: [
      {
        name: "Career Copilot",
        description: "AI career assistant built with TypeScript.",
        technologies: "TypeScript, React",
        url: "https://example.com/career-copilot",
      },
      {
        name: "Humidity Project",
        description: "IoT humidity monitor.",
        technologies: "Python",
        url: null,
      },
      {
        name: "Unrelated Project",
        description: "A personal blog.",
        technologies: "WordPress",
        url: null,
      },
    ],
  },
  jobAnalysis: {
    title: "Software Engineer",
    company: "Acme",
    employmentType: "Full-time",
    location: "Remote",
    experienceLevel: "Mid-level",
    education: null,
    languages: [],
    summary: "Build web products.",
    requiredSkills: ["TypeScript", "REST APIs"],
    responsibilities: ["Build APIs"],
    atsKeywords: ["TypeScript", "REST", "APIs"],
  },
  profileMatch: {
    matchingSkills: ["TypeScript", "REST APIs"],
    missingSkills: [],
    strengths: ["Strong TypeScript experience for the role."],
    weaknesses: [],
    alignmentScore: 82,
    alignmentReasoning: "Core skills are well supported.",
    recommendation: "Strong opportunity. Continue with the application.",
    workingLanguage: "es",
  },
  skillProfile: {
    skills: [
      {
        sourceSkill: "TypeScript",
        canonicalSkill: "TS",
        category: "Front-End",
        professionalWeight: "core_professional",
        jobRelevance: "very_high",
        priority: 1,
        evidence: [{ source: "experience", reference: "experience[0]" }],
      },
      {
        sourceSkill: "REST APIs",
        canonicalSkill: "REST",
        category: "Back-End",
        professionalWeight: "core_professional",
        jobRelevance: "very_high",
        priority: 2,
        evidence: [{ source: "experience", reference: "experience[0]" }],
      },
      {
        sourceSkill: "PostgreSQL",
        canonicalSkill: "Postgres",
        category: "Databases",
        professionalWeight: "general",
        jobRelevance: "none",
        priority: 3,
        evidence: [],
      },
    ],
  },
};

const groupedSkillMasterCv = {
  ...input.masterCv,
  skills: ["React", "Node.js", "TypeScript", "Git", "PostgreSQL"],
};

const groupedSkillProfile = {
  skills: [
    {
      sourceSkill: "React",
      canonicalSkill: "React.js",
      category: "Front-End",
      professionalWeight: "core_professional" as const,
      jobRelevance: "very_high" as const,
      priority: 1,
      evidence: [{ source: "experience" as const, reference: "experience[0]" }],
    },
    {
      sourceSkill: "Node.js",
      canonicalSkill: "Node",
      category: "Back-End",
      professionalWeight: "core_professional" as const,
      jobRelevance: "very_high" as const,
      priority: 2,
      evidence: [],
    },
    {
      sourceSkill: "TypeScript",
      canonicalSkill: "TS",
      category: "Front-End",
      professionalWeight: "core_professional" as const,
      jobRelevance: "high" as const,
      priority: 3,
      evidence: [{ source: "experience" as const, reference: "experience[0]" }],
    },
    {
      sourceSkill: "Git",
      canonicalSkill: "Git SCM",
      category: "Development Tools",
      professionalWeight: "general" as const,
      jobRelevance: "none" as const,
      priority: 4,
      evidence: [],
    },
    {
      sourceSkill: "PostgreSQL",
      canonicalSkill: "Postgres",
      category: "Back-End",
      professionalWeight: "supporting" as const,
      jobRelevance: "low" as const,
      priority: 5,
      evidence: [],
    },
  ],
};

function groupedSkills(
  generatedSkills: string[],
  professionalSummary = groupedSkillMasterCv.professionalSummary,
) {
  return enforceMasterCvIntegrity(
    groupedSkillMasterCv,
    {
      ...groupedSkillMasterCv,
      professionalSummary,
      skills: generatedSkills,
    },
    null,
    null,
    null,
    groupedSkillProfile,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.OPENAI_API_KEY = "test-api-key";
});

afterAll(() => {
  if (originalApiKey === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalApiKey;
  }
});

describe("enforceMasterCvIntegrity", () => {
  it("preserves factual Master CV fields while allowing adapted text", () => {
    const generated = {
      ...input.masterCv,
      fullName: "Changed Name",
      email: "changed@example.com",
      professionalSummary: "TypeScript engineer focused on REST APIs.",
      experience: [
        {
          jobTitle: "Invented Title",
          company: "Invented Company",
          location: "Remote",
          startDate: "2019-01",
          endDate: "2021-01",
          current: false,
          description: "Delivered TypeScript REST APIs for product teams.",
        },
      ],
      education: [
        {
          institution: "Fake University",
          degree: "MSc",
          fieldOfStudy: "AI",
          startDate: "2015",
          endDate: "2019",
          description: "Completed coursework in distributed systems.",
        },
      ],
      skills: ["REST APIs", "Invented Skill", "TypeScript"],
      languages: [{ name: "German", proficiency: "Native" }],
      certifications: [
        {
          name: "Fake Cert",
          issuer: "Fake Issuer",
          issueDate: "2024",
          credentialUrl: "https://example.com",
        },
      ],
      personalProjects: [
        {
          name: "Career Copilot",
          description: "Job-specific TypeScript career assistant.",
          technologies: "Invented Tech",
          url: "https://invented.example.com",
        },
        {
          name: "Invented Project",
          description: "Does not exist in the Master CV.",
          technologies: "Rust",
          url: null,
        },
      ],
    };

    expect(enforceMasterCvIntegrity(input.masterCv, generated)).toEqual({
      fullName: "Taylor Smith",
      professionalTitle: null,
      email: "taylor@example.com",
      phone: null,
      location: "Berlin",
      linkedin: null,
      website: null,
      professionalSummary: "TypeScript engineer focused on REST APIs.",
      experience: [
        {
          jobTitle: "Software Engineer",
          company: "Example",
          location: null,
          startDate: "2020-01",
          endDate: null,
          current: true,
          description: "Delivered TypeScript REST APIs for product teams.",
        },
      ],
      education: [
        {
          institution: "Example University",
          degree: "BSc",
          fieldOfStudy: "Computer Science",
          startDate: "2016",
          endDate: "2020",
          description: "Completed coursework in distributed systems.",
        },
      ],
      skills: ["REST APIs", "TypeScript", "PostgreSQL"],
      languages: [{ name: "English", proficiency: "Fluent" }],
      certifications: [
        {
          name: "AWS Cloud Practitioner",
          issuer: "Amazon",
          issueDate: "2022",
          credentialUrl: null,
        },
      ],
      personalProjects: [
        {
          name: "Career Copilot",
          description: "Job-specific TypeScript career assistant.",
          technologies: "TypeScript, React",
          url: "https://example.com/career-copilot",
        },
      ],
      profilePhotoAssetId: null,
      profilePhotoPositionX: null,
      profilePhotoPositionY: null,
    });
  });

  it("omits Personal Projects when none are selected", () => {
    expect(
      enforceMasterCvIntegrity(input.masterCv, {
        ...input.masterCv,
        personalProjects: [],
      }),
    ).toMatchObject({ personalProjects: [] });
  });

  it("drops invented Personal Projects and preserves Master CV identity fields", () => {
    const result = enforceMasterCvIntegrity(input.masterCv, {
      ...input.masterCv,
      personalProjects: [
        {
          name: "Humidity Project",
          description: "Relevant IoT monitoring for the role.",
          technologies: "Invented",
          url: "https://invented.example.com",
        },
        {
          name: "Missing Project",
          description: "Invented",
          technologies: null,
          url: null,
        },
      ],
    });

    expect(result.personalProjects).toEqual([
      {
        name: "Humidity Project",
        description: "Relevant IoT monitoring for the role.",
        technologies: "Python",
        url: null,
      },
    ]);
  });

  it("keeps Personal Projects empty when the Master CV has none", () => {
    const masterCv = {
      ...input.masterCv,
      personalProjects: [],
    };

    expect(
      enforceMasterCvIntegrity(masterCv, {
        ...masterCv,
        personalProjects: [
          {
            name: "Invented Project",
            description: "Should not appear.",
            technologies: null,
            url: null,
          },
        ],
      }).personalProjects,
    ).toEqual([]);
  });

  it("copies professionalTitle and website from the Master CV", () => {
    const masterCv = {
      ...input.masterCv,
      professionalTitle: "Software Engineer",
      website: "https://example.com/old-portfolio",
    };

    expect(
      enforceMasterCvIntegrity(masterCv, {
        ...masterCv,
        professionalTitle: "Invented Title",
        website: "https://invented.example.com",
      }),
    ).toMatchObject({
      professionalTitle: "Software Engineer",
      website: "https://example.com/old-portfolio",
    });
  });

  it("keeps empty professionalTitle and website empty when the Master CV has none", () => {
    expect(
      enforceMasterCvIntegrity(input.masterCv, {
        ...input.masterCv,
        professionalTitle: "Invented Title",
        website: "https://invented.example.com",
      }),
    ).toMatchObject({
      professionalTitle: null,
      website: null,
    });
  });

  it("attaches the snapshot photo identifier and ignores invented photo fields", () => {
    const assetId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
    const generated = {
      ...input.masterCv,
      profilePhotoAssetId: "invented-id",
      profilePhotoObjectKey: "users/other/master-cv/profile-photo/invented",
    } as typeof input.masterCv & {
      profilePhotoAssetId: string;
      profilePhotoObjectKey: string;
    };

    expect(
      enforceMasterCvIntegrity(input.masterCv, generated, assetId, 25, 75),
    ).toEqual(
      expect.objectContaining({
        profilePhotoAssetId: assetId,
        profilePhotoPositionX: 25,
        profilePhotoPositionY: 75,
      }),
    );
    expect(enforceMasterCvIntegrity(input.masterCv, generated, null)).toEqual(
      expect.objectContaining({
        profilePhotoAssetId: null,
      }),
    );
  });

  it("keeps every Master CV skill in the Skills section", () => {
    expect(groupedSkills(["React"]).skills).toEqual([
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Git",
    ]);
    expect(groupedSkills(["React"]).skillGroups).toEqual([
      { category: "Front-End", skills: ["React", "TypeScript"] },
      { category: "Back-End", skills: ["Node.js", "PostgreSQL"] },
      { category: "Development Tools", skills: ["Git"] },
    ]);
  });

  it("groups Skills-section values by Skill Profile category", () => {
    expect(
      groupedSkills(["Git", "PostgreSQL", "Node.js", "TypeScript", "React"])
        .skillGroups,
    ).toEqual([
      { category: "Front-End", skills: ["React", "TypeScript"] },
      { category: "Back-End", skills: ["Node.js", "PostgreSQL"] },
      { category: "Development Tools", skills: ["Git"] },
    ]);
    expect(groupedSkills(["React"]).skills).toEqual([
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Git",
    ]);
    expect(groupedSkills(["React"]).skills).not.toEqual([
      "React",
      "Node.js",
      "TypeScript",
      "Git",
      "PostgreSQL",
    ]);
  });

  it("renders sourceSkill rather than canonicalSkill", () => {
    const result = groupedSkills([
      "React.js",
      "Node",
      "TS",
      "Git SCM",
      "Postgres",
    ]);
    expect(result.skills).toEqual([
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Git",
    ]);
    expect(result.skillGroups?.flatMap((group) => group.skills)).toEqual(
      result.skills,
    );
  });

  it("never renders canonicalSkill in the Skills section", () => {
    const result = groupedSkills([
      "React.js",
      "Node",
      "TS",
      "Git SCM",
      "Postgres",
    ]);
    const documentFacing = [
      ...result.skills,
      ...(result.skillGroups ?? []).flatMap((group) => group.skills),
    ];

    expect(documentFacing).not.toContain("React.js");
    expect(documentFacing).not.toContain("Node");
    expect(documentFacing).not.toContain("TS");
    expect(documentFacing).not.toContain("Git SCM");
    expect(documentFacing).not.toContain("Postgres");
  });

  it("does not remove a skill because jobRelevance is low or none", () => {
    const result = groupedSkills(["React", "TypeScript", "Node.js"]);
    expect(result.skills).toEqual(
      expect.arrayContaining(["PostgreSQL", "Git"]),
    );
    expect(
      result.skillGroups?.some((group) => group.skills.includes("Git")),
    ).toBe(true);
    expect(
      result.skillGroups?.some((group) => group.skills.includes("PostgreSQL")),
    ).toBe(true);
  });

  it("does not filter skills by Skill Profile priority", () => {
    expect(groupedSkills(["React"]).skills).toEqual(
      expect.arrayContaining(["TypeScript", "Node.js", "PostgreSQL", "Git"]),
    );
    expect(groupedSkills(["React"]).skills).toHaveLength(
      groupedSkillMasterCv.skills.length,
    );
  });

  it("keeps a Professional Summary that emphasizes a Skill Profile subset", () => {
    const result = groupedSkills(
      ["Invented Skill"],
      "React and TypeScript engineer building Node.js APIs.",
    );

    expect(result.professionalSummary).toBe(
      "React and TypeScript engineer building Node.js APIs.",
    );
    expect(result.skills).toEqual([
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Git",
    ]);
    expect(result.skillGroups).toEqual([
      { category: "Front-End", skills: ["React", "TypeScript"] },
      { category: "Back-End", skills: ["Node.js", "PostgreSQL"] },
      { category: "Development Tools", skills: ["Git"] },
    ]);
  });

  it("drops invented skills and does not replace sourceSkill with canonicalSkill", () => {
    expect(
      groupedSkills(["TS", "REST", "Postgres", "Invented Skill", "Docker"])
        .skills,
    ).toEqual(["React", "TypeScript", "Node.js", "PostgreSQL", "Git"]);
    expect(
      groupedSkills(["TS", "REST", "Postgres", "Invented Skill", "Docker"])
        .skillGroups,
    ).toEqual([
      { category: "Front-End", skills: ["React", "TypeScript"] },
      { category: "Back-End", skills: ["Node.js", "PostgreSQL"] },
      { category: "Development Tools", skills: ["Git"] },
    ]);
  });
});

describe("generateOptimizedCvDraft", () => {
  it("returns an integrity-enforced Optimized CV from the AI draft", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        ...input.masterCv,
        fullName: "Changed Name",
        professionalSummary: "TypeScript engineer focused on REST APIs.",
        experience: [
          {
            ...input.masterCv.experience[0],
            company: "Changed Company",
            description: "Delivered TypeScript REST APIs for product teams.",
          },
        ],
        skills: ["Postgres", "Invented Skill", "REST APIs", "TS"],
        personalProjects: [
          {
            name: "Career Copilot",
            description: "Job-specific TypeScript career assistant.",
            technologies: "Invented Tech",
            url: "https://invented.example.com",
          },
          {
            name: "Unrelated Project",
            description: "A personal blog.",
            technologies: "WordPress",
            url: null,
          },
        ],
      }),
    });

    await expect(generateOptimizedCvDraft(input, "es")).resolves.toEqual({
      ...input.masterCv,
      professionalSummary: "TypeScript engineer focused on REST APIs.",
      experience: [
        {
          ...input.masterCv.experience[0],
          description: "Delivered TypeScript REST APIs for product teams.",
        },
      ],
      personalProjects: [
        {
          name: "Career Copilot",
          description: "Job-specific TypeScript career assistant.",
          technologies: "TypeScript, React",
          url: "https://example.com/career-copilot",
        },
        {
          name: "Unrelated Project",
          description: "A personal blog.",
          technologies: "WordPress",
          url: null,
        },
      ],
      skillGroups: [
        { category: "Front-End", skills: ["TypeScript"] },
        { category: "Back-End", skills: ["REST APIs"] },
        { category: "Databases", skills: ["PostgreSQL"] },
      ],
      profilePhotoAssetId: null,
      profilePhotoPositionX: null,
      profilePhotoPositionY: null,
      workingLanguage: "es",
    });
    expect(createResponse).toHaveBeenCalledOnce();
    const payload = JSON.parse(
      createResponse.mock.calls[0][0].input[1].content[0].text as string,
    ) as OptimizedCvGenerationInput;
    expect(payload.skillProfile).toEqual(input.skillProfile);
    const prompt = createResponse.mock.calls[0][0].input[0].content[0]
      .text as string;
    expect(prompt).toContain("single A4 page");
    expect(prompt).toContain(
      "Do not invent a professional title or website. Do not replace Master CV personal information, including professionalTitle and website.",
    );
    expect(prompt).toContain("one-page fit");
    expect(prompt).toContain("3-4 bullets");
    expect(prompt).toContain(
      "Do not invent professional experience, projects, achievements, skills, education, languages, or certifications.",
    );
    expect(prompt).toContain(
      "Do not modify personal information, employment dates, company names, job titles",
    );
    expect(prompt).toContain(
      "Evaluate Master CV personalProjects against the Job Analysis and Profile Match.",
    );
    expect(prompt).toContain("Include only relevant Personal Projects.");
    expect(prompt).toContain("Omit irrelevant Personal Projects.");
    expect(prompt).toContain(
      "Do not control fonts, margins, spacing, columns, or visual layout.",
    );
    expect(prompt).toContain("Spanish (es)");
    expect(prompt).toContain(
      "Use the provided Skill Profile as the shared skill-reasoning context.",
    );
    expect(prompt).toContain(
      "Do not independently reconstruct skill priority from raw Master CV, Job Analysis, or Profile Match skill lists.",
    );
    expect(prompt).toContain(
      "Document-facing skill strings must be sourceSkill.",
    );
    expect(prompt).toContain(
      "Use Skill Profile professionalWeight, jobRelevance, evidence, and priority to guide which existing Master CV skills receive emphasis in the professional summary.",
    );
    expect(prompt).toContain(
      "The professional summary may mention a subset of Master CV skills.",
    );
    expect(prompt).toContain(
      "Never introduce a skill that is absent from the Skill Profile.",
    );
    expect(prompt).toContain(
      "Skill Profile signals may guide emphasis but never authorize unsupported claims.",
    );
    expect(prompt).toContain(
      "Do not turn relevance into expertise. Do not turn professional weight into seniority. Do not infer proficiency levels. Do not infer fluency or communication ability.",
    );
    expect(prompt).toContain(
      "Do not transform a skill mention into an unsupported proficiency claim. Do not change React into expert in React unless the Master CV explicitly supports that claim.",
    );
    expect(prompt).toContain(
      "Do not change English — Intermediate into Conversational English, fluent English, advanced English, or any other upgraded formulation.",
    );
    expect(prompt).toContain(
      "The backend will assemble the Skills section deterministically from the Skill Profile. Do not invent, decide, or re-derive the final Skills-section grouping.",
    );
    expect(prompt).toContain(
      "Do not omit a Master CV skill from the Skills section because jobRelevance is low or none, professionalWeight is lower, priority is lower, or one-page fit is required.",
    );
    expect(prompt).not.toContain(
      "Group the skills array by Skill Profile category.",
    );
    expect(prompt).not.toContain(
      "You may reorder existing skills to emphasize relevance, but only use skills already present in the Master CV.",
    );
    expect(prompt).not.toContain(
      "Order the skills array by Skill Profile priority. Lower priority numbers receive earlier placement.",
    );
  });

  it("reconstructs grouped sourceSkill values even when the draft omits or flattens skills", async () => {
    const generationInput: OptimizedCvGenerationInput = {
      ...input,
      masterCv: groupedSkillMasterCv,
      skillProfile: groupedSkillProfile,
    };
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        ...groupedSkillMasterCv,
        professionalSummary: "React and TypeScript engineer.",
        skills: ["Postgres", "Git SCM", "Invented Skill", "Node"],
      }),
    });

    await expect(
      generateOptimizedCvDraft(generationInput, "en"),
    ).resolves.toEqual(
      expect.objectContaining({
        professionalSummary: "React and TypeScript engineer.",
        skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Git"],
        skillGroups: [
          { category: "Front-End", skills: ["React", "TypeScript"] },
          { category: "Back-End", skills: ["Node.js", "PostgreSQL"] },
          { category: "Development Tools", skills: ["Git"] },
        ],
        workingLanguage: "en",
      }),
    );
  });

  it("instructs the Summary not to claim unsupported expertise", () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(input.masterCv),
    });

    return generateOptimizedCvDraft(input, "en").then(() => {
      const prompt = createResponse.mock.calls[0][0].input[0].content[0]
        .text as string;
      expect(prompt).toContain("Do not turn relevance into expertise.");
      expect(prompt).toContain(
        "Do not change React into expert in React unless the Master CV explicitly supports that claim.",
      );
    });
  });

  it("instructs the Summary not to transform Intermediate English into Conversational English", () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(input.masterCv),
    });

    return generateOptimizedCvDraft(input, "en").then(() => {
      const prompt = createResponse.mock.calls[0][0].input[0].content[0]
        .text as string;
      expect(prompt).toContain(
        "Do not infer language ability beyond what the Master CV explicitly states.",
      );
      expect(prompt).toContain(
        "Do not change English — Intermediate into Conversational English, fluent English, advanced English, or any other upgraded formulation.",
      );
    });
  });

  it("throws when OpenAI is not configured", async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(generateOptimizedCvDraft(input, "es")).rejects.toThrow(
      "OpenAI is not configured.",
    );
  });
});
