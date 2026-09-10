import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProfileComparisonResult } from "../types/profile-comparison.js";

const { createResponse } = vi.hoisted(() => ({
  createResponse: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAIMock {
    responses = { create: createResponse };
  },
}));

import {
  adaptProfileMatchNarrative,
  extractProfileMatchNarrative,
  mergeProfileMatchNarrative,
  PROFILE_MATCH_ADAPTATION_FAILED_MESSAGE,
  ProfileMatchAdaptationError,
  validateProfileMatchNarrativeAdaptation,
} from "./profile-match-adaptation.service.js";

const originalApiKey = process.env.OPENAI_API_KEY;

const savedProfileMatch: ProfileComparisonResult = {
  matchingSkills: ["TypeScript", "REST APIs"],
  missingSkills: ["Docker"],
  strengths: [
    "La experiencia en TypeScript cubre el requisito principal del rol.",
  ],
  weaknesses: ["Docker es requerido por el rol y no aparece en el CV Maestro."],
  alignmentScore: 72,
  alignmentReasoning: "La experiencia backend es relevante, pero falta Docker.",
  recommendation: "Buena oportunidad. Mejora el CV antes de postularte.",
  workingLanguage: "es",
};

const adaptedNarrative = {
  strengths: ["TypeScript experience covers the role's core requirement."],
  weaknesses: ["Docker is required by the role and is not in the Master CV."],
  recommendation: "Good opportunity. Improve the CV before applying.",
  alignmentReasoning: "Backend experience is relevant, but Docker is missing.",
};

function protectedFields(comparison: ProfileComparisonResult) {
  return {
    matchingSkills: comparison.matchingSkills,
    missingSkills: comparison.missingSkills,
    alignmentScore: comparison.alignmentScore,
    workingLanguage: comparison.workingLanguage,
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

describe("Profile Match narrative contract", () => {
  it("extracts only narrative fields", () => {
    expect(extractProfileMatchNarrative(savedProfileMatch)).toEqual({
      strengths: savedProfileMatch.strengths,
      weaknesses: savedProfileMatch.weaknesses,
      recommendation: savedProfileMatch.recommendation,
      alignmentReasoning: savedProfileMatch.alignmentReasoning,
    });
  });

  it("rejects extra fields, missing keys, and length changes", () => {
    const source = extractProfileMatchNarrative(savedProfileMatch);

    expect(() =>
      validateProfileMatchNarrativeAdaptation(
        { ...adaptedNarrative, alignmentScore: 72 },
        source,
      ),
    ).toThrow(ProfileMatchAdaptationError);
    expect(() =>
      validateProfileMatchNarrativeAdaptation(
        {
          strengths: adaptedNarrative.strengths,
          weaknesses: adaptedNarrative.weaknesses,
          recommendation: adaptedNarrative.recommendation,
        },
        source,
      ),
    ).toThrow(ProfileMatchAdaptationError);
    expect(() =>
      validateProfileMatchNarrativeAdaptation(
        {
          ...adaptedNarrative,
          strengths: [...adaptedNarrative.strengths, "Extra"],
        },
        source,
      ),
    ).toThrow(ProfileMatchAdaptationError);
    expect(() =>
      validateProfileMatchNarrativeAdaptation(
        { ...adaptedNarrative, weaknesses: [] },
        source,
      ),
    ).toThrow(ProfileMatchAdaptationError);
  });

  it("merges only narrative fields into a copy", () => {
    const merged = mergeProfileMatchNarrative(
      savedProfileMatch,
      adaptedNarrative,
    );

    expect(merged.strengths).toEqual(adaptedNarrative.strengths);
    expect(merged.weaknesses).toEqual(adaptedNarrative.weaknesses);
    expect(merged.recommendation).toBe(adaptedNarrative.recommendation);
    expect(merged.alignmentReasoning).toBe(adaptedNarrative.alignmentReasoning);
    expect(protectedFields(merged)).toEqual(protectedFields(savedProfileMatch));
    expect(savedProfileMatch.strengths[0]).toContain("TypeScript cubre");
    expect(merged).not.toBe(savedProfileMatch);
  });
});

describe("adaptProfileMatchNarrative", () => {
  it("sends only persisted narrative fields and keeps protected fields unchanged", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(adaptedNarrative),
    });

    const result = await adaptProfileMatchNarrative(savedProfileMatch, "en");

    const request = createResponse.mock.calls[0][0] as {
      input: Array<{ content: Array<{ text: string }> }>;
    };
    expect(JSON.parse(request.input[1].content[0].text)).toEqual(
      extractProfileMatchNarrative(savedProfileMatch),
    );
    expect(JSON.parse(request.input[1].content[0].text)).not.toHaveProperty(
      "matchingSkills",
    );
    expect(JSON.parse(request.input[1].content[0].text)).not.toHaveProperty(
      "missingSkills",
    );
    expect(JSON.parse(request.input[1].content[0].text)).not.toHaveProperty(
      "alignmentScore",
    );
    expect(request.input[0].content[0].text).toContain("English (en)");
    expect(request.input[0].content[0].text).toContain("Spanish (es)");
    expect(request.input[0].content[0].text).not.toContain(
      "Write all generated narrative text",
    );
    expect(protectedFields(result)).toEqual(protectedFields(savedProfileMatch));
    expect(result.strengths).toEqual(adaptedNarrative.strengths);
    expect(savedProfileMatch.recommendation).toBe(
      "Buena oportunidad. Mejora el CV antes de postularte.",
    );
  });

  it("uses the unknown-language instruction when workingLanguage is null", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(adaptedNarrative),
    });

    await adaptProfileMatchNarrative(
      { ...savedProfileMatch, workingLanguage: null },
      "fr",
    );

    const instructions = (
      createResponse.mock.calls[0][0] as {
        input: Array<{ content: Array<{ text: string }> }>;
      }
    ).input[0].content[0].text;
    expect(instructions).toContain("French (fr)");
    expect(instructions).toContain("source language is unknown");
    expect(instructions).toContain(
      "Leave narrative text that is already in the target language unchanged",
    );
    expect(instructions).not.toMatch(/Spanish|English/);
  });

  it("fails atomically on malformed AI output", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        ...adaptedNarrative,
        strengths: ["changed"],
        extra: "nope",
      }),
    });

    await expect(
      adaptProfileMatchNarrative(savedProfileMatch, "en"),
    ).rejects.toMatchObject({
      message: PROFILE_MATCH_ADAPTATION_FAILED_MESSAGE,
      statusCode: 502,
    });
    expect(savedProfileMatch.strengths).toEqual([
      "La experiencia en TypeScript cubre el requisito principal del rol.",
    ]);
  });

  it("preserves empty narrative arrays", async () => {
    const emptySaved = {
      ...savedProfileMatch,
      strengths: [] as string[],
      weaknesses: [] as string[],
    };
    const emptyAdapted = {
      strengths: [] as string[],
      weaknesses: [] as string[],
      recommendation: "Good opportunity.",
      alignmentReasoning: "Limited evidence.",
    };
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(emptyAdapted),
    });

    const result = await adaptProfileMatchNarrative(emptySaved, "en");

    expect(result.strengths).toEqual([]);
    expect(result.weaknesses).toEqual([]);
    expect(
      JSON.parse(
        (
          createResponse.mock.calls[0][0] as {
            input: Array<{ content: Array<{ text: string }> }>;
          }
        ).input[1].content[0].text,
      ),
    ).toEqual(extractProfileMatchNarrative(emptySaved));
  });
});
