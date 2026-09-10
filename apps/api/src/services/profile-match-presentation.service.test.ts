import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProfileComparisonResult } from "../types/profile-comparison.js";

vi.mock("./application.service.js", () => ({
  ApplicationError: class ApplicationError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  getOwnedApplication: vi.fn(),
}));

vi.mock("../repositories/profile-match.repository.js", () => ({
  findProfileMatchByApplicationId: vi.fn(),
  upsertProfileMatch: vi.fn(),
}));

vi.mock("./profile-comparison-ai.service.js", () => ({
  evaluateProfileAlignment: vi.fn(),
  generateRecommendation: vi.fn(),
  identifyMatchingSkills: vi.fn(),
  identifyMissingSkills: vi.fn(),
  identifyStrengths: vi.fn(),
  identifyWeaknesses: vi.fn(),
}));

vi.mock("./profile-match-adaptation.service.js", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("./profile-match-adaptation.service.js")
    >();
  return {
    ...actual,
    adaptProfileMatchNarrative: vi.fn(),
  };
});

import {
  findProfileMatchByApplicationId,
  upsertProfileMatch,
} from "../repositories/profile-match.repository.js";
import {
  ApplicationError,
  getOwnedApplication,
} from "./application.service.js";
import {
  evaluateProfileAlignment,
  generateRecommendation,
  identifyMatchingSkills,
  identifyMissingSkills,
  identifyStrengths,
  identifyWeaknesses,
} from "./profile-comparison-ai.service.js";
import {
  adaptProfileMatchNarrative,
  PROFILE_MATCH_ADAPTATION_FAILED_MESSAGE,
  ProfileMatchAdaptationError,
} from "./profile-match-adaptation.service.js";
import {
  assertStoredProfileMatch,
  presentProfileMatch,
  ProfileMatchPresentationError,
  shouldAdaptProfileMatch,
} from "./profile-match-presentation.service.js";

const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const userId = "4e9c843b-5c3d-4e65-8514-7de898b2aca6";

const persisted: ProfileComparisonResult = {
  matchingSkills: ["TypeScript", "REST APIs"],
  missingSkills: ["Docker"],
  strengths: ["Experiencia en TypeScript para el rol."],
  weaknesses: ["Falta Docker."],
  alignmentScore: 72,
  alignmentReasoning: "Hay evidencia relevante, pero falta Docker.",
  recommendation: "Buena oportunidad.",
  workingLanguage: "es",
};

const persistedRow = {
  id: "profile-match-id",
  applicationId,
  ...persisted,
  createdAt: new Date("2026-08-11T10:00:00.000Z"),
  updatedAt: new Date("2026-08-11T10:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOwnedApplication).mockResolvedValue({
    id: applicationId,
  } as never);
  vi.mocked(findProfileMatchByApplicationId).mockResolvedValue(
    persistedRow as never,
  );
  vi.mocked(adaptProfileMatchNarrative).mockImplementation(
    async (saved, locale) => ({
      ...structuredClone(saved),
      strengths: saved.strengths.map((item) => `${item} [${locale}]`),
      weaknesses: saved.weaknesses.map((item) => `${item} [${locale}]`),
      recommendation: `${saved.recommendation} [${locale}]`,
      alignmentReasoning: `${saved.alignmentReasoning} [${locale}]`,
    }),
  );
});

describe("shouldAdaptProfileMatch", () => {
  it("skips adaptation only when a known working language equals the requested locale", () => {
    expect(shouldAdaptProfileMatch("es", "es")).toBe(false);
    expect(shouldAdaptProfileMatch("es", "fr")).toBe(true);
    expect(shouldAdaptProfileMatch(null, "en")).toBe(true);
  });
});

describe("assertStoredProfileMatch", () => {
  it("returns a copy of a valid stored Profile Match", () => {
    expect(assertStoredProfileMatch(persistedRow)).toEqual(persisted);
  });

  it("treats a missing workingLanguage as null without substituting a locale", () => {
    const { workingLanguage: _ignored, ...row } = persistedRow;
    void _ignored;
    expect(assertStoredProfileMatch(row).workingLanguage).toBeNull();
  });

  it("rejects malformed stored rows before adaptation", () => {
    expect(() =>
      assertStoredProfileMatch({
        ...persistedRow,
        matchingSkills: ["TypeScript", 1],
      }),
    ).toThrow(ProfileMatchPresentationError);
    expect(() =>
      assertStoredProfileMatch({
        ...persistedRow,
        alignmentScore: 101,
      }),
    ).toThrow(ProfileMatchPresentationError);
    expect(() =>
      assertStoredProfileMatch({
        ...persistedRow,
        workingLanguage: "de",
      }),
    ).toThrow(
      new ProfileMatchPresentationError(
        "The saved Profile Match is invalid.",
        400,
      ),
    );
  });
});

describe("presentProfileMatch", () => {
  it("returns persisted narrative without calling adaptation AI when languages match", async () => {
    const presentation = await presentProfileMatch(applicationId, userId, "es");

    expect(presentation).toEqual(persisted);
    expect(presentation).not.toBe(persisted);
    expect(adaptProfileMatchNarrative).not.toHaveBeenCalled();
    expect(upsertProfileMatch).not.toHaveBeenCalled();
    expect(identifyMatchingSkills).not.toHaveBeenCalled();
    expect(identifyMissingSkills).not.toHaveBeenCalled();
    expect(identifyStrengths).not.toHaveBeenCalled();
    expect(identifyWeaknesses).not.toHaveBeenCalled();
    expect(evaluateProfileAlignment).not.toHaveBeenCalled();
    expect(generateRecommendation).not.toHaveBeenCalled();
  });

  it("adapts only narrative fields from the persisted source for a different locale", async () => {
    const presentation = await presentProfileMatch(applicationId, userId, "fr");

    expect(adaptProfileMatchNarrative).toHaveBeenCalledWith(persisted, "fr");
    expect(presentation.strengths).toEqual([
      "Experiencia en TypeScript para el rol. [fr]",
    ]);
    expect(presentation.weaknesses).toEqual(["Falta Docker. [fr]"]);
    expect(presentation.recommendation).toBe("Buena oportunidad. [fr]");
    expect(presentation.alignmentReasoning).toBe(
      "Hay evidencia relevante, pero falta Docker. [fr]",
    );
    expect(presentation.matchingSkills).toEqual(persisted.matchingSkills);
    expect(presentation.missingSkills).toEqual(persisted.missingSkills);
    expect(presentation.alignmentScore).toBe(72);
    expect(presentation.workingLanguage).toBe("es");
    expect(upsertProfileMatch).not.toHaveBeenCalled();
  });

  it("adapts a legacy null workingLanguage without stamping a locale", async () => {
    vi.mocked(findProfileMatchByApplicationId).mockResolvedValue({
      ...persistedRow,
      workingLanguage: null,
    } as never);

    const presentation = await presentProfileMatch(applicationId, userId, "en");

    expect(adaptProfileMatchNarrative).toHaveBeenCalledWith(
      { ...persisted, workingLanguage: null },
      "en",
    );
    expect(presentation.workingLanguage).toBeNull();
    expect(findProfileMatchByApplicationId).toHaveBeenCalledTimes(1);
  });

  it("always starts later locale requests from the persisted source", async () => {
    await presentProfileMatch(applicationId, userId, "en");
    await presentProfileMatch(applicationId, userId, "fr");

    expect(adaptProfileMatchNarrative).toHaveBeenNthCalledWith(
      1,
      persisted,
      "en",
    );
    expect(adaptProfileMatchNarrative).toHaveBeenNthCalledWith(
      2,
      persisted,
      "fr",
    );
  });

  it("returns 404 when no Profile Match exists and does not call AI", async () => {
    vi.mocked(findProfileMatchByApplicationId).mockResolvedValue(null);

    await expect(
      presentProfileMatch(applicationId, userId, "es"),
    ).rejects.toEqual(
      new ProfileMatchPresentationError("Profile Match not found.", 404),
    );
    expect(adaptProfileMatchNarrative).not.toHaveBeenCalled();
  });

  it("rejects malformed stored data before adaptation", async () => {
    vi.mocked(findProfileMatchByApplicationId).mockResolvedValue({
      ...persistedRow,
      strengths: "not-an-array",
    } as never);

    await expect(
      presentProfileMatch(applicationId, userId, "fr"),
    ).rejects.toEqual(
      new ProfileMatchPresentationError(
        "The saved Profile Match is invalid.",
        400,
      ),
    );
    expect(adaptProfileMatchNarrative).not.toHaveBeenCalled();
  });

  it("maps missing application ownership before loading the row", async () => {
    vi.mocked(getOwnedApplication).mockRejectedValue(
      new ApplicationError("Application not found.", 404),
    );

    await expect(
      presentProfileMatch(applicationId, userId, "es"),
    ).rejects.toEqual(
      new ProfileMatchPresentationError("Application not found.", 404),
    );
    expect(findProfileMatchByApplicationId).not.toHaveBeenCalled();
    expect(adaptProfileMatchNarrative).not.toHaveBeenCalled();
  });

  it("does not write when adaptation fails", async () => {
    vi.mocked(adaptProfileMatchNarrative).mockRejectedValue(
      new ProfileMatchAdaptationError(),
    );

    await expect(
      presentProfileMatch(applicationId, userId, "fr"),
    ).rejects.toMatchObject({
      message: PROFILE_MATCH_ADAPTATION_FAILED_MESSAGE,
      statusCode: 502,
    });
    expect(upsertProfileMatch).not.toHaveBeenCalled();
  });
});
