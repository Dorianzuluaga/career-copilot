import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { createResponse } = vi.hoisted(() => ({
  createResponse: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAIMock {
    responses = { create: createResponse };
  },
}));

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn().mockResolvedValue(Buffer.from("pdf")),
}));

import {
  extractMasterCv,
  isMasterCvExtraction,
} from "./master-cv-extraction.service.js";

const originalApiKey = process.env.OPENAI_API_KEY;

const validExtraction = {
  personalInformation: {
    fullName: "Taylor Smith",
    professionalTitle: null,
    email: "taylor@example.com",
    phone: null,
    location: null,
    linkedin: null,
    website: null,
  },
  professionalSummary: null,
  experience: [
    {
      jobTitle: "Software Engineer",
      company: "Example",
      location: null,
      startDate: "2020-01",
      endDate: null,
      current: true,
      description: "Built APIs",
    },
  ],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  personalProjects: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.OPENAI_API_KEY = "test-api-key";
});

afterAll(() => {
  if (originalApiKey === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalApiKey;
  }
});

describe("master CV extraction schema", () => {
  it("accepts personal information with professionalTitle and website", () => {
    expect(
      isMasterCvExtraction({
        ...validExtraction,
        personalInformation: {
          ...validExtraction.personalInformation,
          professionalTitle: "Software Engineer",
          website: "https://example.com",
        },
      }),
    ).toBe(true);
  });

  it("rejects the former portfolio field name", () => {
    expect(
      isMasterCvExtraction({
        ...validExtraction,
        personalInformation: {
          fullName: "Taylor Smith",
          email: "taylor@example.com",
          phone: null,
          location: null,
          linkedin: null,
          portfolio: "https://example.com",
        },
      }),
    ).toBe(false);
  });

  it("leaves professionalTitle and website null when the source has no such values", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(validExtraction),
    });

    const result = await extractMasterCv("/tmp/cv.pdf", "cv.pdf");

    expect(result.personalInformation.professionalTitle).toBeNull();
    expect(result.personalInformation.website).toBeNull();
    const prompt = createResponse.mock.calls[0][0].input[0].content[1]
      .text as string;
    expect(prompt).toContain(
      "Extract professionalTitle only when the uploaded CV presents a professional headline",
    );
    expect(prompt).toContain(
      "Do not copy an Experience jobTitle into professionalTitle",
    );
    expect(prompt).toContain("Do not place a LinkedIn URL in website.");
  });
});
