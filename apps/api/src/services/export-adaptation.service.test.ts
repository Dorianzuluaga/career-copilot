import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { CoverLetter } from "../types/cover-letter.js";
import type { OptimizedCv } from "../types/optimized-cv.js";

vi.mock("../repositories/master-cv.repository.js", () => ({
  createMasterCv: vi.fn(),
  findMasterCvByUserId: vi.fn(),
  updateMasterCv: vi.fn(),
}));

const { createResponse } = vi.hoisted(() => ({
  createResponse: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAIMock {
    responses = { create: createResponse };
  },
}));

import {
  adaptCoverLetterNarrative,
  adaptOptimizedCvNarrative,
  DOCUMENT_ADAPTATION_FAILED_MESSAGE,
  DocumentAdaptationError,
  extractCoverLetterNarrative,
  extractOptimizedCvNarrative,
  mergeCoverLetterNarrative,
  mergeOptimizedCvNarrative,
  validateCoverLetterNarrativeAdaptation,
  validateOptimizedCvNarrativeAdaptation,
} from "./export-adaptation.service.js";

const originalApiKey = process.env.OPENAI_API_KEY;

const savedOptimizedCv: OptimizedCv = {
  fullName: "Taylor Smith",
  professionalTitle: "Software Engineer",
  email: "taylor@example.com",
  phone: "+1 555 0100",
  location: "Berlin",
  linkedin: "https://linkedin.com/in/taylor",
  website: "https://taylor.dev",
  professionalSummary: "Ingeniero de software construyendo APIs.",
  experience: [
    {
      jobTitle: "Software Engineer",
      company: "Example GmbH",
      location: "Berlin",
      startDate: "2020-01",
      endDate: null,
      current: true,
      description: "Construí APIs REST con TypeScript.",
    },
    {
      jobTitle: "Intern",
      company: "Start SRL",
      location: null,
      startDate: "2019-01",
      endDate: "2019-12",
      current: false,
      description: null,
    },
  ],
  education: [
    {
      institution: "Example University",
      degree: "BSc",
      fieldOfStudy: "Computer Science",
      startDate: "2016",
      endDate: "2020",
      description: "Estudié ingeniería de software.",
    },
  ],
  skills: ["TypeScript", "PostgreSQL"],
  languages: [{ name: "Spanish", proficiency: "Native" }],
  certifications: [
    {
      name: "AWS Cloud Practitioner",
      issuer: "Amazon",
      issueDate: "2022",
      credentialUrl: "https://aws.example/cert",
    },
  ],
  personalProjects: [
    {
      name: "Career Copilot",
      description: "Asistente de carrera con TypeScript.",
      technologies: "TypeScript, React",
      url: "https://example.com/career-copilot",
    },
  ],
  profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
  profilePhotoPositionX: 0.4,
  profilePhotoPositionY: 0.6,
  workingLanguage: "es",
};

const savedCoverLetter: CoverLetter = {
  candidateName: "Taylor Smith",
  email: "taylor@example.com",
  phone: "+1 555 0100",
  date: "August 8, 2026",
  companyName: "Acme",
  greeting: "Estimado equipo de contratación,",
  introduction: "Me postulo para el rol.",
  professionalValue: "He construido APIs en TypeScript.",
  motivation: "Quiero contribuir al producto de Acme.",
  closing: "Gracias por su consideración.",
  signature: "Taylor Smith",
  workingLanguage: "es",
};

const adaptedCvNarrative = {
  professionalSummary: "Software engineer building APIs.",
  experienceDescriptions: ["I built REST APIs with TypeScript.", null],
  educationDescriptions: ["I studied software engineering."],
  personalProjectDescriptions: ["Career assistant built with TypeScript."],
};

const adaptedCoverLetterNarrative = {
  greeting: "Dear hiring team,",
  introduction: "I am applying for the role.",
  professionalValue: "I have built APIs in TypeScript.",
  motivation: "I want to contribute to Acme's product.",
  closing: "Thank you for your consideration.",
};

function omitDescription<T extends { description?: string | null }>(
  item: T,
): Omit<T, "description"> {
  const { description: _ignored, ...rest } = item;
  void _ignored;
  return rest;
}

function protectedOptimizedCvFields(document: OptimizedCv) {
  return {
    fullName: document.fullName,
    professionalTitle: document.professionalTitle,
    email: document.email,
    phone: document.phone,
    location: document.location,
    linkedin: document.linkedin,
    website: document.website,
    experience: document.experience.map(omitDescription),
    education: document.education.map(omitDescription),
    skills: document.skills,
    languages: document.languages,
    certifications: document.certifications,
    personalProjects: document.personalProjects?.map(omitDescription),
    profilePhotoAssetId: document.profilePhotoAssetId,
    profilePhotoPositionX: document.profilePhotoPositionX,
    profilePhotoPositionY: document.profilePhotoPositionY,
    workingLanguage: document.workingLanguage,
  };
}

function protectedCoverLetterFields(document: CoverLetter) {
  return {
    candidateName: document.candidateName,
    email: document.email,
    phone: document.phone,
    date: document.date,
    companyName: document.companyName,
    signature: document.signature,
    workingLanguage: document.workingLanguage,
  };
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

describe("Optimized CV narrative contract", () => {
  it("extracts only narrative fields", () => {
    expect(extractOptimizedCvNarrative(savedOptimizedCv)).toEqual({
      professionalSummary: savedOptimizedCv.professionalSummary,
      experienceDescriptions: ["Construí APIs REST con TypeScript.", null],
      educationDescriptions: ["Estudié ingeniería de software."],
      personalProjectDescriptions: ["Asistente de carrera con TypeScript."],
    });
  });

  it("rejects extra fields, length changes, and null-semantic changes", () => {
    const source = extractOptimizedCvNarrative(savedOptimizedCv);

    expect(() =>
      validateOptimizedCvNarrativeAdaptation(
        { ...adaptedCvNarrative, fullName: "Changed" },
        source,
      ),
    ).toThrow(DocumentAdaptationError);

    expect(() =>
      validateOptimizedCvNarrativeAdaptation(
        {
          ...adaptedCvNarrative,
          experienceDescriptions: ["Only one description"],
        },
        source,
      ),
    ).toThrow(DocumentAdaptationError);

    expect(() =>
      validateOptimizedCvNarrativeAdaptation(
        {
          ...adaptedCvNarrative,
          experienceDescriptions: [
            "I built REST APIs with TypeScript.",
            "Invented intern description.",
          ],
        },
        source,
      ),
    ).toThrow(DocumentAdaptationError);

    expect(() =>
      validateOptimizedCvNarrativeAdaptation(
        {
          ...adaptedCvNarrative,
          experienceDescriptions: [null, null],
        },
        source,
      ),
    ).toThrow(DocumentAdaptationError);
  });

  it("merges only narrative fields into a deep copy", () => {
    const merged = mergeOptimizedCvNarrative(
      savedOptimizedCv,
      adaptedCvNarrative,
    );

    expect(merged.professionalSummary).toBe(
      adaptedCvNarrative.professionalSummary,
    );
    expect(merged.experience.map((item) => item.description)).toEqual(
      adaptedCvNarrative.experienceDescriptions,
    );
    expect(merged.education.map((item) => item.description)).toEqual(
      adaptedCvNarrative.educationDescriptions,
    );
    expect(merged.personalProjects?.map((item) => item.description)).toEqual(
      adaptedCvNarrative.personalProjectDescriptions,
    );
    expect(protectedOptimizedCvFields(merged)).toEqual(
      protectedOptimizedCvFields(savedOptimizedCv),
    );
    expect(merged).not.toBe(savedOptimizedCv);
    expect(merged.experience).not.toBe(savedOptimizedCv.experience);
    expect(savedOptimizedCv.professionalSummary).toBe(
      "Ingeniero de software construyendo APIs.",
    );
  });
});

describe("Cover Letter narrative contract", () => {
  it("extracts only narrative fields", () => {
    expect(extractCoverLetterNarrative(savedCoverLetter)).toEqual({
      greeting: savedCoverLetter.greeting,
      introduction: savedCoverLetter.introduction,
      professionalValue: savedCoverLetter.professionalValue,
      motivation: savedCoverLetter.motivation,
      closing: savedCoverLetter.closing,
    });
  });

  it("rejects extra fields including date", () => {
    expect(() =>
      validateCoverLetterNarrativeAdaptation({
        ...adaptedCoverLetterNarrative,
        date: "7 août 2026",
      }),
    ).toThrow(DocumentAdaptationError);

    expect(() =>
      validateCoverLetterNarrativeAdaptation({
        greeting: adaptedCoverLetterNarrative.greeting,
      }),
    ).toThrow(DocumentAdaptationError);
  });

  it("merges only narrative fields into a deep copy", () => {
    const merged = mergeCoverLetterNarrative(
      savedCoverLetter,
      adaptedCoverLetterNarrative,
    );

    expect(merged).toEqual({
      ...savedCoverLetter,
      ...adaptedCoverLetterNarrative,
    });
    expect(protectedCoverLetterFields(merged)).toEqual(
      protectedCoverLetterFields(savedCoverLetter),
    );
    expect(merged).not.toBe(savedCoverLetter);
    expect(savedCoverLetter.greeting).toBe("Estimado equipo de contratación,");
  });
});

describe("adaptOptimizedCvNarrative", () => {
  it("sends only saved narrative fields and merges a valid adaptation", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(adaptedCvNarrative),
    });

    const result = await adaptOptimizedCvNarrative(savedOptimizedCv, "en");

    const request = createResponse.mock.calls[0][0] as {
      input: Array<{ content: Array<{ text: string }> }>;
    };
    expect(JSON.parse(request.input[1].content[0].text)).toEqual(
      extractOptimizedCvNarrative(savedOptimizedCv),
    );
    expect(request.input[1].content[0].text).not.toContain("Taylor Smith");
    expect(request.input[1].content[0].text).not.toContain(
      "taylor@example.com",
    );
    expect(request.input[1].content[0].text).not.toContain("Example GmbH");
    expect(request.input[1].content[0].text).not.toContain(
      "https://example.com/career-copilot",
    );
    expect(request.input[0].content[0].text).toContain("English (en)");
    expect(request.input[0].content[0].text).toContain("Spanish (es)");
    expect(result.professionalSummary).toBe(
      adaptedCvNarrative.professionalSummary,
    );
    expect(protectedOptimizedCvFields(result)).toEqual(
      protectedOptimizedCvFields(savedOptimizedCv),
    );
    expect(savedOptimizedCv.professionalSummary).toBe(
      "Ingeniero de software construyendo APIs.",
    );
  });

  it("uses the legacy unknown-language instruction when workingLanguage is null", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(adaptedCvNarrative),
    });

    await adaptOptimizedCvNarrative(
      { ...savedOptimizedCv, workingLanguage: null },
      "fr",
    );

    const instructions = (
      createResponse.mock.calls[0][0] as {
        input: Array<{ content: Array<{ text: string }> }>;
      }
    ).input[0].content[0].text;
    expect(instructions).toContain("French (fr)");
    expect(instructions).toContain("source working language is unknown");
    expect(instructions).toContain(
      "Leave narrative text that is already in the target language unchanged",
    );
  });

  it("fails atomically on malformed AI output", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        ...adaptedCvNarrative,
        experienceDescriptions: ["changed"],
      }),
    });

    await expect(
      adaptOptimizedCvNarrative(savedOptimizedCv, "en"),
    ).rejects.toMatchObject({
      message: DOCUMENT_ADAPTATION_FAILED_MESSAGE,
      statusCode: 502,
    });
    expect(savedOptimizedCv.experience[0]?.description).toBe(
      "Construí APIs REST con TypeScript.",
    );
  });
});

describe("adaptCoverLetterNarrative", () => {
  it("sends only saved narrative fields and keeps protected fields unchanged", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(adaptedCoverLetterNarrative),
    });

    const result = await adaptCoverLetterNarrative(savedCoverLetter, "en");

    const request = createResponse.mock.calls[0][0] as {
      input: Array<{ content: Array<{ text: string }> }>;
    };
    expect(JSON.parse(request.input[1].content[0].text)).toEqual(
      extractCoverLetterNarrative(savedCoverLetter),
    );
    expect(request.input[1].content[0].text).not.toContain("Taylor Smith");
    expect(request.input[1].content[0].text).not.toContain("August 8, 2026");
    expect(request.input[0].content[0].text).toContain(
      "Do not return, translate, or generate a date",
    );
    expect(protectedCoverLetterFields(result)).toEqual(
      protectedCoverLetterFields(savedCoverLetter),
    );
    expect(result.greeting).toBe(adaptedCoverLetterNarrative.greeting);
  });

  it("maps AI failures to a stable 502 without mutating the source", async () => {
    createResponse.mockRejectedValue(new Error("model unavailable"));

    await expect(
      adaptCoverLetterNarrative(savedCoverLetter, "fr"),
    ).rejects.toMatchObject({
      message: DOCUMENT_ADAPTATION_FAILED_MESSAGE,
      statusCode: 502,
    });
    expect(savedCoverLetter.introduction).toBe("Me postulo para el rol.");
  });
});
