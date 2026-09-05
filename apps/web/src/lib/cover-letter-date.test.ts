import { describe, expect, it } from "vitest";
import { formatCoverLetterWorkspaceDate } from "./cover-letter-date";

describe("formatCoverLetterWorkspaceDate", () => {
  it("formats new ISO dates according to Working Language", () => {
    expect(formatCoverLetterWorkspaceDate("2026-08-07", "es")).toBe(
      "7 de agosto de 2026",
    );
    expect(formatCoverLetterWorkspaceDate("2026-08-07", "en")).toBe(
      "August 7, 2026",
    );
    expect(formatCoverLetterWorkspaceDate("2026-08-07", "fr")).toBe(
      "7 août 2026",
    );
  });

  it("leaves legacy English long dates unchanged", () => {
    expect(formatCoverLetterWorkspaceDate("August 7, 2026", "fr")).toBe(
      "August 7, 2026",
    );
  });

  it("leaves ISO dates unchanged when Working Language is unknown", () => {
    expect(formatCoverLetterWorkspaceDate("2026-08-07", null)).toBe(
      "2026-08-07",
    );
  });
});
