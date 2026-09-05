import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CoverLetter } from "../types/cover-letter.js";
import type { OptimizedCv } from "../types/optimized-cv.js";

vi.mock("../repositories/master-cv.repository.js", () => ({
  createMasterCv: vi.fn(),
  findMasterCvByUserId: vi.fn(),
  updateMasterCv: vi.fn(),
}));

vi.mock("./export-adaptation.service.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./export-adaptation.service.js")>();
  return {
    ...actual,
    adaptOptimizedCvNarrative: vi.fn(),
    adaptCoverLetterNarrative: vi.fn(),
  };
});

import {
  adaptCoverLetterNarrative,
  adaptOptimizedCvNarrative,
  DOCUMENT_ADAPTATION_FAILED_MESSAGE,
  DocumentAdaptationError,
} from "./export-adaptation.service.js";
import {
  preparePresentationDocument,
  shouldAdaptDocument,
} from "./export-presentation.service.js";

const optimizedCv: OptimizedCv = {
  fullName: "Taylor Smith",
  professionalTitle: null,
  email: "taylor@example.com",
  phone: null,
  location: null,
  linkedin: null,
  website: null,
  professionalSummary: "Saved Spanish summary",
  experience: [
    {
      jobTitle: "Software Engineer",
      company: "Example",
      location: null,
      startDate: "2020-01",
      endDate: null,
      current: true,
      description: "Built APIs.",
    },
  ],
  education: [],
  skills: ["TypeScript"],
  languages: [],
  certifications: [],
  workingLanguage: "es",
};

const coverLetter: CoverLetter = {
  candidateName: "Taylor Smith",
  email: "taylor@example.com",
  phone: null,
  date: "August 8, 2026",
  companyName: "Acme",
  greeting: "Dear Hiring Manager,",
  introduction: "Saved English introduction",
  professionalValue: "Value",
  motivation: "Motivation",
  closing: "Closing",
  signature: "Taylor Smith",
  workingLanguage: "en",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(adaptOptimizedCvNarrative).mockImplementation(
    async (saved, locale) => ({
      ...structuredClone(saved),
      professionalSummary: `${saved.professionalSummary} [${locale}]`,
    }),
  );
  vi.mocked(adaptCoverLetterNarrative).mockImplementation(
    async (saved, locale) => ({
      ...structuredClone(saved),
      introduction: `${saved.introduction} [${locale}]`,
    }),
  );
});

describe("shouldAdaptDocument", () => {
  it("skips adaptation when Working Language equals Presentation Language", () => {
    expect(shouldAdaptDocument("es", "es")).toBe(false);
    expect(shouldAdaptDocument("en", "fr")).toBe(true);
    expect(shouldAdaptDocument(null, "es")).toBe(true);
  });
});

describe("preparePresentationDocument", () => {
  it("skips AI when the saved Working Language matches Presentation Language", async () => {
    const preview = await preparePresentationDocument("optimized-cv", "es", {
      optimizedCv,
      coverLetter,
    });

    expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
    expect(adaptCoverLetterNarrative).not.toHaveBeenCalled();
    expect(preview).toEqual({
      document: "optimized-cv",
      presentationLanguage: "es",
      data: optimizedCv,
    });
    expect(preview.data).not.toBe(optimizedCv);
  });

  it("adapts only the requested document from the saved source", async () => {
    const preview = await preparePresentationDocument("optimized-cv", "fr", {
      optimizedCv,
      coverLetter,
    });

    expect(adaptOptimizedCvNarrative).toHaveBeenCalledWith(optimizedCv, "fr");
    expect(adaptCoverLetterNarrative).not.toHaveBeenCalled();
    expect(preview).toMatchObject({
      document: "optimized-cv",
      presentationLanguage: "fr",
      data: {
        professionalSummary: "Saved Spanish summary [fr]",
        workingLanguage: "es",
      },
    });
  });

  it("uses the same Presentation Language when adapting a Cover Letter with a different Working Language", async () => {
    const preview = await preparePresentationDocument("cover-letter", "fr", {
      optimizedCv,
      coverLetter,
    });

    expect(adaptCoverLetterNarrative).toHaveBeenCalledWith(coverLetter, "fr");
    expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
    expect(preview).toEqual({
      document: "cover-letter",
      presentationLanguage: "fr",
      data: {
        ...coverLetter,
        introduction: "Saved English introduction [fr]",
      },
    });
  });

  it("adapts legacy documents whose Working Language is unknown", async () => {
    await preparePresentationDocument("cover-letter", "en", {
      optimizedCv,
      coverLetter: { ...coverLetter, workingLanguage: null },
    });

    expect(adaptCoverLetterNarrative).toHaveBeenCalledWith(
      { ...coverLetter, workingLanguage: null },
      "en",
    );
  });

  it("always starts from the original saved document", async () => {
    await preparePresentationDocument("optimized-cv", "fr", {
      optimizedCv,
      coverLetter,
    });
    await preparePresentationDocument("optimized-cv", "en", {
      optimizedCv,
      coverLetter,
    });

    expect(adaptOptimizedCvNarrative).toHaveBeenNthCalledWith(
      1,
      optimizedCv,
      "fr",
    );
    expect(adaptOptimizedCvNarrative).toHaveBeenNthCalledWith(
      2,
      optimizedCv,
      "en",
    );
    expect(optimizedCv.professionalSummary).toBe("Saved Spanish summary");
  });

  it("rejects malformed saved documents before AI adaptation", async () => {
    await expect(
      preparePresentationDocument("optimized-cv", "fr", {
        optimizedCv: {
          ...optimizedCv,
          email: "not-an-email",
        },
        coverLetter,
      }),
    ).rejects.toMatchObject({
      message: "The saved Optimized CV is invalid.",
      statusCode: 400,
    });

    await expect(
      preparePresentationDocument("cover-letter", "fr", {
        optimizedCv,
        coverLetter: {
          ...coverLetter,
          candidateName: "",
        },
      }),
    ).rejects.toMatchObject({
      message: "The saved Cover Letter is invalid.",
      statusCode: 400,
    });

    expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
    expect(adaptCoverLetterNarrative).not.toHaveBeenCalled();
  });

  it("rejects an unsupported stored Working Language before AI adaptation", async () => {
    await expect(
      preparePresentationDocument("optimized-cv", "en", {
        optimizedCv: {
          ...optimizedCv,
          workingLanguage: "de" as never,
        },
        coverLetter,
      }),
    ).rejects.toMatchObject({
      message: "The saved Optimized CV is invalid.",
      statusCode: 400,
    });
    expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
  });

  it("does not call adaptation for the other document when package data is malformed", async () => {
    await expect(
      preparePresentationDocument("optimized-cv", "fr", {
        optimizedCv,
        coverLetter: { ...coverLetter, email: "bad" },
      }),
    ).rejects.toMatchObject({
      message: "The saved Cover Letter is invalid.",
      statusCode: 400,
    });
    expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
    expect(adaptCoverLetterNarrative).not.toHaveBeenCalled();
  });

  it("surfaces adaptation failure without returning partial content", async () => {
    vi.mocked(adaptOptimizedCvNarrative).mockRejectedValue(
      new DocumentAdaptationError(),
    );

    await expect(
      preparePresentationDocument("optimized-cv", "fr", {
        optimizedCv,
        coverLetter,
      }),
    ).rejects.toMatchObject({
      message: DOCUMENT_ADAPTATION_FAILED_MESSAGE,
      statusCode: 502,
    });
  });
});
