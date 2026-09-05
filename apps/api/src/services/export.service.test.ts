import { beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("./master-cv.service.js", () => ({
  MasterCvError: class MasterCvError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  getMasterCv: vi.fn(),
}));

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

import { getOwnedApplication } from "./application.service.js";
import {
  getCoverLetter,
  generateCoverLetter,
  saveCoverLetter,
  CoverLetterError,
} from "./cover-letter.service.js";
import { renderDocument } from "./document-rendering.service.js";
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
  experience: [],
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
    expectNoGenerationOrPersistence();
  });
});

describe("exportApplicationDocument", () => {
  it("renders an optimized CV PDF from the latest saved documents", async () => {
    const result = await exportApplicationDocument(
      applicationId,
      userId,
      "optimized-cv",
      "fr",
    );

    expect(getOptimizedCv).toHaveBeenCalledWith(applicationId, userId);
    expect(getCoverLetter).toHaveBeenCalledWith(applicationId, userId);
    expect(renderDocument).toHaveBeenCalledWith(
      {
        type: "optimized-cv",
        data: optimizedCv,
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
        data: optimizedCv,
        profilePhotoBytes: null,
      },
      "pdf",
    );
    expect(optimizedCv.professionalTitle).toBeNull();
  });

  it("loads Optimized CV snapshot bytes and does not read the Master CV photo", async () => {
    const photoBytes = Buffer.from("photo-bytes");
    vi.mocked(getOptimizedCv).mockResolvedValue({
      ...optimizedCv,
      profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
    });
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

    expect(readOptimizedCvPhoto).toHaveBeenCalledWith(
      applicationId,
      userId,
      "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
    );
    expect(renderDocument).toHaveBeenCalledWith(
      {
        type: "optimized-cv",
        data: {
          ...optimizedCv,
          profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
        },
        profilePhotoBytes: photoBytes,
      },
      "pdf",
    );
  });

  it("renders a cover letter PDF with the Master CV candidate name", async () => {
    const result = await exportApplicationDocument(
      applicationId,
      userId,
      "cover-letter",
      "es",
    );

    expect(renderDocument).toHaveBeenCalledWith(
      { type: "cover-letter", data: coverLetter },
      "pdf",
    );
    expect(result.filename).toBe("juan-perez_cover-letter.pdf");
    expectNoGenerationOrPersistence();
  });

  it("uses the latest saved documents even when Presentation Language differs from Working Language", async () => {
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

    expect(renderDocument).toHaveBeenNthCalledWith(
      1,
      {
        type: "optimized-cv",
        data: editedCv,
        profilePhotoBytes: null,
      },
      "pdf",
    );
    expect(renderDocument).toHaveBeenNthCalledWith(
      2,
      { type: "cover-letter", data: editedCoverLetter },
      "pdf",
    );
    expect(editedCv.workingLanguage).toBe("es");
    expect(editedCoverLetter.workingLanguage).toBe("en");
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
  });
});

describe("previewExportDocument", () => {
  it("returns the latest saved Optimized CV with the selected Presentation Language", async () => {
    const preview = await previewExportDocument(
      applicationId,
      userId,
      "optimized-cv",
      "fr",
    );

    expect(preview).toEqual({
      document: "optimized-cv",
      presentationLanguage: "fr",
      data: optimizedCv,
    });
    expect(getOptimizedCv).toHaveBeenCalledWith(applicationId, userId);
    expect(getCoverLetter).toHaveBeenCalledWith(applicationId, userId);
    expect(renderDocument).not.toHaveBeenCalled();
    expect(getMasterCv).not.toHaveBeenCalled();
    expectNoGenerationOrPersistence();
  });

  it("returns the latest saved Cover Letter with the same Presentation Language", async () => {
    const preview = await previewExportDocument(
      applicationId,
      userId,
      "cover-letter",
      "fr",
    );

    expect(preview).toEqual({
      document: "cover-letter",
      presentationLanguage: "fr",
      data: coverLetter,
    });
    expect(preview.data.workingLanguage).toBe("en");
    expectNoGenerationOrPersistence();
  });

  it("keeps Presentation Language independent from UI locale and Working Language", async () => {
    const preview = await previewExportDocument(
      applicationId,
      userId,
      "optimized-cv",
      "en",
    );

    expect(preview.presentationLanguage).toBe("en");
    expect(preview.data.workingLanguage).toBe("es");
    expect(preview.data).toEqual(optimizedCv);
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
    expectNoGenerationOrPersistence();
  });
});
