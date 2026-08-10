import { describe, expect, it } from "vitest";
import {
  buildCoverLetterFilename,
  buildOptimizedCvFilename,
  readOptionalProfessionalTitle,
  slugifyFilenamePart,
} from "./export-filename.js";

describe("export filename helpers", () => {
  it("slugifies filenames with accents, whitespace, and unsupported characters", () => {
    expect(slugifyFilenamePart("Juan Pérez")).toBe("juan-perez");
    expect(slugifyFilenamePart("Full Stack Developer!")).toBe(
      "full-stack-developer",
    );
    expect(slugifyFilenamePart("  A   B  ")).toBe("a-b");
  });

  it("builds the optimized CV filename with an optional professional title", () => {
    expect(
      buildOptimizedCvFilename("Juan Pérez", "Full Stack Developer"),
    ).toBe("juan-perez_full-stack-developer_cv.pdf");
    expect(buildOptimizedCvFilename("Juan Pérez", null)).toBe(
      "juan-perez_cv.pdf",
    );
    expect(buildOptimizedCvFilename("Juan Pérez", "   ")).toBe(
      "juan-perez_cv.pdf",
    );
  });

  it("builds the cover letter filename from the candidate name", () => {
    expect(buildCoverLetterFilename("Juan Pérez")).toBe(
      "juan-perez_cover-letter.pdf",
    );
  });

  it("reads an optional professional title when present", () => {
    expect(
      readOptionalProfessionalTitle({
        fullName: "Taylor Smith",
        professionalTitle: " Software Engineer ",
      }),
    ).toBe("Software Engineer");
    expect(
      readOptionalProfessionalTitle({
        fullName: "Taylor Smith",
      }),
    ).toBeNull();
  });
});
