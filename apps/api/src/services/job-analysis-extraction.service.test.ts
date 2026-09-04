import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { createResponse } = vi.hoisted(() => ({
  createResponse: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAIMock {
    responses = { create: createResponse };
  },
}));

import { extractJobAnalysis } from "./job-analysis-extraction.service.js";

const originalApiKey = process.env.OPENAI_API_KEY;
const originalDescription = "Développer des API TypeScript.";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.OPENAI_API_KEY = "test-api-key";
  createResponse.mockResolvedValue({
    output_text: JSON.stringify({
      title: "Ingénieur logiciel",
      company: null,
      employmentType: null,
      location: null,
      experienceLevel: null,
      education: null,
      languages: [],
      summary: "Développement de produits web.",
      requiredSkills: ["TypeScript"],
      responsibilities: ["Développer des API"],
      atsKeywords: ["TypeScript"],
    }),
  });
});

afterAll(() => {
  if (originalApiKey === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalApiKey;
  }
});

describe("extractJobAnalysis", () => {
  it("requests the validated locale without changing the original job text", async () => {
    await extractJobAnalysis(originalDescription, "fr");

    const request = createResponse.mock.calls[0][0];
    expect(request.input[0].content[0].text).toContain("French (fr)");
    expect(request.input[1].content[0].text).toBe(originalDescription);
  });
});
