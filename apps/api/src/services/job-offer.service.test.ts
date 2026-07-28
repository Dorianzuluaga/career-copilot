import { describe, expect, it, vi } from "vitest";

vi.mock("../repositories/job-offer.repository.js", () => ({
  createJobOffer: vi.fn(),
  findJobOfferByApplicationId: vi.fn(),
}));

vi.mock("./application.service.js", () => ({
  getOwnedApplication: vi.fn(),
}));

import { JobOfferError, validateJobDescription } from "./job-offer.service.js";

describe("validateJobDescription", () => {
  it.each([
    [undefined, "Job description is required."],
    ["   ", "Job description is required."],
    ["a".repeat(299), "The job description is too short."],
    [
      "a".repeat(25_001),
      "The job description exceeds the maximum allowed length.",
    ],
    [`${"a".repeat(300)}\u0000`, "Job description must be plain text."],
  ])("rejects invalid input", (value, message) => {
    expect(() => validateJobDescription(value)).toThrowError(
      new JobOfferError(message, 400),
    );
  });

  it("returns valid text without changing the original", () => {
    const description = `  ${"Role description ".repeat(20)}  `;
    expect(validateJobDescription(description)).toBe(description);
  });
});
