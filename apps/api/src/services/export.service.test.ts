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
import { getCoverLetter, CoverLetterError } from "./cover-letter.service.js";
import { renderDocument } from "./document-rendering.service.js";
import {
  exportApplicationDocument,
  ExportError,
  validateExportDocumentType,
} from "./export.service.js";
import { getMasterCv } from "./master-cv.service.js";
import { getOptimizedCv, OptimizedCvError } from "./optimized-cv.service.js";

const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const userId = "4e9c843b-5c3d-4e65-8514-7de898b2aca6";

const optimizedCv = {
  fullName: "Taylor Smith",
  email: "taylor@example.com",
  phone: null,
  location: null,
  linkedin: null,
  portfolio: null,
  professionalSummary: "Summary",
  experience: [],
  education: [],
  skills: ["TypeScript"],
  languages: [],
  certifications: [],
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
};

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

describe("exportApplicationDocument", () => {
  it("validates the requested document type", () => {
    expect(validateExportDocumentType("optimized-cv")).toBe("optimized-cv");
    expect(validateExportDocumentType("cover-letter")).toBe("cover-letter");
    expect(() => validateExportDocumentType("zip")).toThrow(ExportError);
  });

  it("renders an optimized CV PDF from the latest saved documents", async () => {
    const result = await exportApplicationDocument(
      applicationId,
      userId,
      "optimized-cv",
    );

    expect(getOptimizedCv).toHaveBeenCalledWith(applicationId, userId);
    expect(getCoverLetter).toHaveBeenCalledWith(applicationId, userId);
    expect(renderDocument).toHaveBeenCalledWith(
      { type: "optimized-cv", data: optimizedCv },
      "pdf",
    );
    expect(result).toEqual({
      buffer: Buffer.from("%PDF-1.4"),
      filename: "juan-perez_cv.pdf",
      contentType: "application/pdf",
    });
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
    );

    expect(result.filename).toBe("juan-perez_full-stack-developer_cv.pdf");
  });

  it("renders a cover letter PDF with the Master CV candidate name", async () => {
    const result = await exportApplicationDocument(
      applicationId,
      userId,
      "cover-letter",
    );

    expect(renderDocument).toHaveBeenCalledWith(
      { type: "cover-letter", data: coverLetter },
      "pdf",
    );
    expect(result.filename).toBe("juan-perez_cover-letter.pdf");
  });

  it("rejects export when a required saved document is missing", async () => {
    vi.mocked(getCoverLetter).mockRejectedValue(
      new CoverLetterError("Cover Letter not found.", 404),
    );

    await expect(
      exportApplicationDocument(applicationId, userId, "optimized-cv"),
    ).rejects.toMatchObject({
      message:
        "A saved Optimized CV and Cover Letter are required before export.",
      statusCode: 400,
    });
    expect(renderDocument).not.toHaveBeenCalled();
  });

  it("rejects export when the optimized CV is missing", async () => {
    vi.mocked(getOptimizedCv).mockRejectedValue(
      new OptimizedCvError("Optimized CV not found.", 404),
    );

    await expect(
      exportApplicationDocument(applicationId, userId, "cover-letter"),
    ).rejects.toMatchObject({
      message:
        "A saved Optimized CV and Cover Letter are required before export.",
      statusCode: 400,
    });
    expect(renderDocument).not.toHaveBeenCalled();
  });
});
