import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/master-cv.repository.js", () => ({
  createMasterCv: vi.fn(),
  findMasterCvByUserId: vi.fn(),
  updateMasterCv: vi.fn(),
}));

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

vi.mock("./optimized-cv.service.js", () => ({
  OptimizedCvError: class OptimizedCvError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  getOptimizedCv: vi.fn(),
  generateOptimizedCv: vi.fn(),
  saveOptimizedCv: vi.fn(),
  readOptimizedCvPhoto: vi.fn(),
}));

vi.mock("./cover-letter.service.js", () => ({
  CoverLetterError: class CoverLetterError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  getCoverLetter: vi.fn(),
  generateCoverLetter: vi.fn(),
  saveCoverLetter: vi.fn(),
}));

vi.mock("./master-cv.service.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./master-cv.service.js")>();
  return {
    ...actual,
    getMasterCv: vi.fn(),
  };
});

vi.mock("./document-rendering.service.js", () => ({
  DocumentRenderingError: class DocumentRenderingError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  renderDocument: vi.fn(),
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

import { getOwnedApplication } from "./application.service.js";
import {
  getCoverLetter,
  generateCoverLetter,
  saveCoverLetter,
  CoverLetterError,
} from "./cover-letter.service.js";
import {
  resolveCoverLetterDocumentChrome,
  resolveOptimizedCvDocumentChrome,
} from "../documents/document-localization.js";
import { renderDocument } from "./document-rendering.service.js";
import {
  adaptCoverLetterNarrative,
  adaptOptimizedCvNarrative,
  DOCUMENT_ADAPTATION_FAILED_MESSAGE,
  DocumentAdaptationError,
} from "./export-adaptation.service.js";
import {
  exportApplicationDocument,
  ExportError,
  previewExportDocument,
  validateExportDocumentType,
  validatePresentationLanguage,
} from "./export.service.js";
import { getMasterCv } from "./master-cv.service.js";
import {
  getOptimizedCv,
  generateOptimizedCv,
  saveOptimizedCv,
  OptimizedCvError,
  readOptimizedCvPhoto,
} from "./optimized-cv.service.js";

const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const userId = "4e9c843b-5c3d-4e65-8514-7de898b2aca6";

const optimizedCv = {
  fullName: "Taylor Smith",
  professionalTitle: null,
  email: "taylor@example.com",
  phone: null,
  location: null,
  linkedin: null,
  website: null,
  professionalSummary: "Summary",
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
  workingLanguage: "es" as const,
};

const coverLetter = {
  candidateName: "Taylor Smith",
  email: "taylor@example.com",
  phone: null,
  date: "August 8, 2026",
  companyName: "Acme",
  greeting: "Dear Hiring Manager,",
  introduction: "Intro",
  professionalValue: "Value",
  motivation: "Motivation",
  closing: "Closing",
  signature: "Taylor Smith",
  workingLanguage: "en" as const,
};

function adaptedOptimizedCv(locale: "es" | "en" | "fr") {
  return {
    ...structuredClone(optimizedCv),
    professionalSummary: `${optimizedCv.professionalSummary} [${locale}]`,
  };
}

function adaptedCoverLetter(locale: "es" | "en" | "fr") {
  return {
    ...structuredClone(coverLetter),
    introduction: `${coverLetter.introduction} [${locale}]`,
  };
}

function expectNoGenerationOrPersistence() {
  expect(generateOptimizedCv).not.toHaveBeenCalled();
  expect(generateCoverLetter).not.toHaveBeenCalled();
  expect(saveOptimizedCv).not.toHaveBeenCalled();
  expect(saveCoverLetter).not.toHaveBeenCalled();
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOwnedApplication).mockResolvedValue({
    id: applicationId,
    userId,
  } as never);
  vi.mocked(getOptimizedCv).mockResolvedValue(optimizedCv);
  vi.mocked(getCoverLetter).mockResolvedValue(coverLetter);
  vi.mocked(getMasterCv).mockResolvedValue({
    fullName: "Juan Pérez",
  } as never);
  vi.mocked(renderDocument).mockResolvedValue(Buffer.from("%PDF-1.4"));
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

describe("export request contract", () => {
  it("validates the requested document type", () => {
    expect(validateExportDocumentType("optimized-cv")).toBe("optimized-cv");
    expect(validateExportDocumentType("cover-letter")).toBe("cover-letter");
    expect(() => validateExportDocumentType("zip")).toThrow(ExportError);
  });

  it.each(["es", "en", "fr"] as const)(
    "accepts presentationLanguage %s",
    (locale) => {
      expect(validatePresentationLanguage(locale)).toBe(locale);
    },
  );

  it.each([undefined, null, "", "de", 42])(
    "rejects invalid presentationLanguage %s before loading documents",
    async (value) => {
      await expect(
        exportApplicationDocument(applicationId, userId, "optimized-cv", value),
      ).rejects.toMatchObject({
        message: 'presentationLanguage must be one of "es", "en", or "fr".',
        statusCode: 400,
      });
      await expect(
        previewExportDocument(applicationId, userId, "cover-letter", value),
      ).rejects.toMatchObject({
        message: 'presentationLanguage must be one of "es", "en", or "fr".',
        statusCode: 400,
      });
      expect(getOwnedApplication).not.toHaveBeenCalled();
      expect(getOptimizedCv).not.toHaveBeenCalled();
      expect(getCoverLetter).not.toHaveBeenCalled();
      expect(getMasterCv).not.toHaveBeenCalled();
      expect(renderDocument).not.toHaveBeenCalled();
      expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
      expect(adaptCoverLetterNarrative).not.toHaveBeenCalled();
      expectNoGenerationOrPersistence();
    },
  );

  it("rejects an invalid document type before loading documents", async () => {
    await expect(
      exportApplicationDocument(applicationId, userId, "zip", "fr"),
    ).rejects.toMatchObject({
      message: 'document must be "optimized-cv" or "cover-letter".',
      statusCode: 400,
    });
    expect(getOwnedApplication).not.toHaveBeenCalled();
    expect(renderDocument).not.toHaveBeenCalled();
    expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
    expectNoGenerationOrPersistence();
  });
});

describe("exportApplicationDocument", () => {
  it("skips AI when Optimized CV Working Language matches Presentation Language", async () => {
    const result = await exportApplicationDocument(
      applicationId,
      userId,
      "optimized-cv",
      "es",
    );

    expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
    expect(adaptCoverLetterNarrative).not.toHaveBeenCalled();
    expect(renderDocument).toHaveBeenCalledWith(
      {
        type: "optimized-cv",
        data: optimizedCv,
        chrome: resolveOptimizedCvDocumentChrome("es"),
        profilePhotoBytes: null,
      },
      "pdf",
    );
    expect(result).toEqual({
      buffer: Buffer.from("%PDF-1.4"),
      filename: "juan-perez_cv.pdf",
      contentType: "application/pdf",
    });
    expectNoGenerationOrPersistence();
  });

  it("adapts a different-language Optimized CV in memory before rendering", async () => {
    const result = await exportApplicationDocument(
      applicationId,
      userId,
      "optimized-cv",
      "fr",
    );

    expect(getOptimizedCv).toHaveBeenCalledWith(applicationId, userId);
    expect(getCoverLetter).toHaveBeenCalledWith(applicationId, userId);
    expect(adaptOptimizedCvNarrative).toHaveBeenCalledWith(optimizedCv, "fr");
    expect(adaptCoverLetterNarrative).not.toHaveBeenCalled();
    expect(renderDocument).toHaveBeenCalledWith(
      {
        type: "optimized-cv",
        data: adaptedOptimizedCv("fr"),
        chrome: resolveOptimizedCvDocumentChrome("fr"),
        profilePhotoBytes: null,
      },
      "pdf",
    );
    expect(result.filename).toBe("juan-perez_cv.pdf");
    expect(optimizedCv.professionalSummary).toBe("Summary");
    expectNoGenerationOrPersistence();
  });

  it("includes the professional title when Master CV provides one", async () => {
    vi.mocked(getMasterCv).mockResolvedValue({
      fullName: "Juan Pérez",
      professionalTitle: "Full Stack Developer",
    } as never);

    const result = await exportApplicationDocument(
      applicationId,
      userId,
      "optimized-cv",
      "en",
    );

    expect(result.filename).toBe("juan-perez_full-stack-developer_cv.pdf");
    expect(renderDocument).toHaveBeenCalledWith(
      {
        type: "optimized-cv",
        data: adaptedOptimizedCv("en"),
        chrome: resolveOptimizedCvDocumentChrome("en"),
        profilePhotoBytes: null,
      },
      "pdf",
    );
    expect(optimizedCv.professionalTitle).toBeNull();
  });

  it("loads Optimized CV snapshot bytes and does not read the Master CV photo", async () => {
    const photoBytes = Buffer.from("photo-bytes");
    const savedWithPhoto = {
      ...optimizedCv,
      profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
    };
    vi.mocked(getOptimizedCv).mockResolvedValue(savedWithPhoto);
    vi.mocked(readOptimizedCvPhoto).mockResolvedValue({
      bytes: photoBytes,
      contentType: "image/jpeg",
    });

    await exportApplicationDocument(
      applicationId,
      userId,
      "optimized-cv",
      "es",
    );

    expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
    expect(readOptimizedCvPhoto).toHaveBeenCalledWith(
      applicationId,
      userId,
      "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
    );
    expect(renderDocument).toHaveBeenCalledWith(
      {
        type: "optimized-cv",
        data: savedWithPhoto,
        chrome: resolveOptimizedCvDocumentChrome("es"),
        profilePhotoBytes: photoBytes,
      },
      "pdf",
    );
  });

  it("renders a cover letter PDF adapted to the requested Presentation Language", async () => {
    const result = await exportApplicationDocument(
      applicationId,
      userId,
      "cover-letter",
      "es",
    );

    expect(adaptCoverLetterNarrative).toHaveBeenCalledWith(coverLetter, "es");
    expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
    expect(renderDocument).toHaveBeenCalledWith(
      {
        type: "cover-letter",
        data: adaptedCoverLetter("es"),
        chrome: resolveCoverLetterDocumentChrome(coverLetter.date, "es"),
      },
      "pdf",
    );
    expect(result.filename).toBe("juan-perez_cover-letter.pdf");
    expectNoGenerationOrPersistence();
  });

  it("applies one Presentation Language to both package documents from the saved sources", async () => {
    const editedCv = {
      ...optimizedCv,
      professionalSummary: "Edited summary",
      workingLanguage: "es" as const,
    };
    const editedCoverLetter = {
      ...coverLetter,
      introduction: "Edited introduction",
      workingLanguage: "en" as const,
    };
    vi.mocked(getOptimizedCv).mockResolvedValue(editedCv);
    vi.mocked(getCoverLetter).mockResolvedValue(editedCoverLetter);

    await exportApplicationDocument(
      applicationId,
      userId,
      "optimized-cv",
      "fr",
    );
    await exportApplicationDocument(
      applicationId,
      userId,
      "cover-letter",
      "fr",
    );

    expect(adaptOptimizedCvNarrative).toHaveBeenCalledWith(editedCv, "fr");
    expect(adaptCoverLetterNarrative).toHaveBeenCalledWith(
      editedCoverLetter,
      "fr",
    );
    expect(renderDocument).toHaveBeenNthCalledWith(
      1,
      {
        type: "optimized-cv",
        data: {
          ...editedCv,
          professionalSummary: "Edited summary [fr]",
        },
        chrome: resolveOptimizedCvDocumentChrome("fr"),
        profilePhotoBytes: null,
      },
      "pdf",
    );
    expect(renderDocument).toHaveBeenNthCalledWith(
      2,
      {
        type: "cover-letter",
        data: {
          ...editedCoverLetter,
          introduction: "Edited introduction [fr]",
        },
        chrome: resolveCoverLetterDocumentChrome(editedCoverLetter.date, "fr"),
      },
      "pdf",
    );
    expect(editedCv.workingLanguage).toBe("es");
    expect(editedCoverLetter.workingLanguage).toBe("en");
    expect(editedCv.professionalSummary).toBe("Edited summary");
    expect(editedCoverLetter.introduction).toBe("Edited introduction");
    expectNoGenerationOrPersistence();
  });

  it("starts every re-export from the original saved working document", async () => {
    await exportApplicationDocument(
      applicationId,
      userId,
      "optimized-cv",
      "fr",
    );
    await exportApplicationDocument(
      applicationId,
      userId,
      "optimized-cv",
      "en",
    );

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
    expect(optimizedCv.professionalSummary).toBe("Summary");
    expectNoGenerationOrPersistence();
  });

  it("returns 502 when adaptation fails and does not render or persist", async () => {
    vi.mocked(adaptOptimizedCvNarrative).mockRejectedValue(
      new DocumentAdaptationError(),
    );

    await expect(
      exportApplicationDocument(applicationId, userId, "optimized-cv", "fr"),
    ).rejects.toMatchObject({
      message: DOCUMENT_ADAPTATION_FAILED_MESSAGE,
      statusCode: 502,
    });
    expect(renderDocument).not.toHaveBeenCalled();
    expect(getMasterCv).not.toHaveBeenCalled();
    expect(optimizedCv.professionalSummary).toBe("Summary");
    expectNoGenerationOrPersistence();
  });

  it("rejects malformed saved documents before AI adaptation", async () => {
    vi.mocked(getOptimizedCv).mockResolvedValue({
      ...optimizedCv,
      email: "not-an-email",
    });

    await expect(
      exportApplicationDocument(applicationId, userId, "optimized-cv", "fr"),
    ).rejects.toMatchObject({
      message: "The saved Optimized CV is invalid.",
      statusCode: 400,
    });
    expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
    expect(renderDocument).not.toHaveBeenCalled();
    expectNoGenerationOrPersistence();
  });

  it("rejects export when a required saved document is missing", async () => {
    vi.mocked(getCoverLetter).mockRejectedValue(
      new CoverLetterError("Cover Letter not found.", 404),
    );

    await expect(
      exportApplicationDocument(applicationId, userId, "optimized-cv", "es"),
    ).rejects.toMatchObject({
      message:
        "A saved Optimized CV and Cover Letter are required before export.",
      statusCode: 400,
    });
    expect(renderDocument).not.toHaveBeenCalled();
    expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
    expectNoGenerationOrPersistence();
  });

  it("rejects export when the optimized CV is missing", async () => {
    vi.mocked(getOptimizedCv).mockRejectedValue(
      new OptimizedCvError("Optimized CV not found.", 404),
    );

    await expect(
      exportApplicationDocument(applicationId, userId, "cover-letter", "en"),
    ).rejects.toMatchObject({
      message:
        "A saved Optimized CV and Cover Letter are required before export.",
      statusCode: 400,
    });
    expect(renderDocument).not.toHaveBeenCalled();
    expect(adaptCoverLetterNarrative).not.toHaveBeenCalled();
  });
});

describe("previewExportDocument", () => {
  it("returns the saved Optimized CV when Presentation Language matches Working Language", async () => {
    const preview = await previewExportDocument(
      applicationId,
      userId,
      "optimized-cv",
      "es",
    );

    expect(preview).toEqual({
      document: "optimized-cv",
      presentationLanguage: "es",
      data: optimizedCv,
      chrome: resolveOptimizedCvDocumentChrome("es"),
    });
    expect(adaptOptimizedCvNarrative).not.toHaveBeenCalled();
    expect(getOptimizedCv).toHaveBeenCalledWith(applicationId, userId);
    expect(getCoverLetter).toHaveBeenCalledWith(applicationId, userId);
    expect(renderDocument).not.toHaveBeenCalled();
    expect(getMasterCv).not.toHaveBeenCalled();
    expectNoGenerationOrPersistence();
  });

  it("returns an in-memory adapted Cover Letter for a different Presentation Language", async () => {
    const preview = await previewExportDocument(
      applicationId,
      userId,
      "cover-letter",
      "fr",
    );

    expect(preview).toEqual({
      document: "cover-letter",
      presentationLanguage: "fr",
      data: adaptedCoverLetter("fr"),
      chrome: resolveCoverLetterDocumentChrome(coverLetter.date, "fr"),
    });
    expect(preview.data.workingLanguage).toBe("en");
    expect(coverLetter.introduction).toBe("Intro");
    expectNoGenerationOrPersistence();
  });

  it("keeps Presentation Language independent from Working Language after adaptation", async () => {
    const preview = await previewExportDocument(
      applicationId,
      userId,
      "optimized-cv",
      "en",
    );

    expect(preview).toMatchObject({
      document: "optimized-cv",
      presentationLanguage: "en",
      data: {
        professionalSummary: "Summary [en]",
        workingLanguage: "es",
      },
      chrome: resolveOptimizedCvDocumentChrome("en"),
    });
    expect(optimizedCv.professionalSummary).toBe("Summary");
  });

  it("gives Preview and PDF the same localized language entries", async () => {
    const savedLanguages = [
      { name: "Español", proficiency: "Nativo" },
      { name: "English", proficiency: "Intermedio" },
    ];
    const savedCv = { ...optimizedCv, languages: savedLanguages };
    vi.mocked(getOptimizedCv).mockResolvedValue(savedCv);

    const preview = await previewExportDocument(
      applicationId,
      userId,
      "optimized-cv",
      "fr",
    );
    await exportApplicationDocument(
      applicationId,
      userId,
      "optimized-cv",
      "fr",
    );

    const localizedLanguages = [
      { name: "Espagnol", proficiency: "Natif" },
      { name: "Anglais", proficiency: "Intermédiaire" },
    ];
    expect(preview.data).toMatchObject({ languages: localizedLanguages });
    expect(renderDocument).toHaveBeenCalledWith(
      {
        type: "optimized-cv",
        data: preview.data,
        chrome: preview.chrome,
        profilePhotoBytes: null,
      },
      "pdf",
    );
    expect(savedCv.languages).toEqual(savedLanguages);
    expectNoGenerationOrPersistence();
  });

  it("returns 502 when preview adaptation fails without persisting", async () => {
    vi.mocked(adaptCoverLetterNarrative).mockRejectedValue(
      new DocumentAdaptationError(),
    );

    await expect(
      previewExportDocument(applicationId, userId, "cover-letter", "es"),
    ).rejects.toMatchObject({
      message: DOCUMENT_ADAPTATION_FAILED_MESSAGE,
      statusCode: 502,
    });
    expectNoGenerationOrPersistence();
  });

  it("rejects preview when a required saved document is missing", async () => {
    vi.mocked(getOptimizedCv).mockRejectedValue(
      new OptimizedCvError("Optimized CV not found.", 404),
    );

    await expect(
      previewExportDocument(applicationId, userId, "cover-letter", "es"),
    ).rejects.toMatchObject({
      message:
        "A saved Optimized CV and Cover Letter are required before export.",
      statusCode: 400,
    });
    expect(adaptCoverLetterNarrative).not.toHaveBeenCalled();
    expectNoGenerationOrPersistence();
  });
});
