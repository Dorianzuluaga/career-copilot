import { describe, expect, it } from "vitest";
import {
  getDocumentsBlockingSectionLeave,
  getDocumentsBlockingWorkspaceExit,
  isDocumentDirty,
} from "./unsaved-documents";

const savedCv = {
  fullName: "Taylor",
  professionalSummary: "Saved summary",
};

const editedCv = {
  fullName: "Taylor",
  professionalSummary: "Edited summary",
};

const documents = [
  {
    id: "optimized-cv",
    label: "Optimized CV",
    section: "optimized-cv",
    working: editedCv,
    saved: savedCv,
  },
  {
    id: "cover-letter",
    label: "Cover Letter",
    section: "cover-letter",
    working: { introduction: "Saved intro" },
    saved: { introduction: "Saved intro" },
  },
];

describe("unsaved documents", () => {
  it("treats matching null Working Language as clean and a draft locale change as dirty", () => {
    const legacy = { ...savedCv, workingLanguage: null };
    const generated = { ...savedCv, workingLanguage: "fr" };

    expect(isDocumentDirty(legacy, legacy)).toBe(false);
    expect(isDocumentDirty(generated, legacy)).toBe(true);
    expect(
      isDocumentDirty(
        { ...legacy, professionalSummary: "Edited summary" },
        legacy,
      ),
    ).toBe(true);
  });

  it("detects dirty documents with deep equality", () => {
    expect(isDocumentDirty(editedCv, savedCv)).toBe(true);
    expect(isDocumentDirty(savedCv, { ...savedCv })).toBe(false);
    expect(isDocumentDirty(null, savedCv)).toBe(false);
    expect(isDocumentDirty(editedCv, null)).toBe(true);
  });

  it("blocks only the document owned by the section being left", () => {
    expect(getDocumentsBlockingSectionLeave("optimized-cv", documents)).toEqual(
      [{ id: "optimized-cv", label: "Optimized CV" }],
    );
    expect(getDocumentsBlockingSectionLeave("cover-letter", documents)).toEqual(
      [],
    );
    expect(getDocumentsBlockingSectionLeave("overview", documents)).toEqual([]);
  });

  it("blocks every dirty document when leaving the workspace", () => {
    expect(getDocumentsBlockingWorkspaceExit(documents)).toEqual([
      { id: "optimized-cv", label: "Optimized CV" },
    ]);

    expect(
      getDocumentsBlockingWorkspaceExit([
        documents[0]!,
        {
          ...documents[1]!,
          working: { introduction: "Edited intro" },
        },
      ]),
    ).toEqual([
      { id: "optimized-cv", label: "Optimized CV" },
      { id: "cover-letter", label: "Cover Letter" },
    ]);
  });
});
