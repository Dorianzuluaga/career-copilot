import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProfileComparisonInput } from "../types/profile-comparison.js";

const { createResponse } = vi.hoisted(() => ({
  createResponse: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAIMock {
    responses = { create: createResponse };
  },
}));

import {
  evaluateProfileAlignment,
  generateRecommendation,
  identifyMatchingSkills,
  identifyMissingSkills,
  identifyStrengths,
  identifyWeaknesses,
} from "./profile-comparison-ai.service.js";

const originalApiKey = process.env.OPENAI_API_KEY;
const input: ProfileComparisonInput = {
  masterCv: {
    fullName: "Taylor Smith",
    email: "taylor@example.com",
    phone: null,
    location: null,
    linkedin: null,
    portfolio: null,
    professionalSummary: "Software engineer building web APIs.",
    experience: [
      {
        jobTitle: "Software Engineer",
        company: "Example",
        location: null,
        startDate: null,
        endDate: null,
        current: true,
        description: "Built REST APIs with TypeScript.",
      },
    ],
    education: [],
    skills: ["TypeScript", "REST APIs"],
    languages: [],
    certifications: [],
  },
  jobAnalysis: {
    title: "Software Engineer",
    company: "Acme",
    employmentType: "Full-time",
    location: "Remote",
    experienceLevel: "Mid-level",
    education: null,
    languages: [],
    summary: "Build web products.",
    requiredSkills: ["TypeScript", "REST APIs", "AWS"],
    responsibilities: ["Build APIs"],
    atsKeywords: ["TypeScript", "REST", "AWS"],
  },
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

describe("identifyMatchingSkills", () => {
  it("returns a concise, normalized list of matching skills", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        matchingSkills: [" TypeScript ", "REST APIs", "typescript", " "],
      }),
    });

    await expect(identifyMatchingSkills(input)).resolves.toEqual({
      matchingSkills: ["TypeScript", "REST APIs"],
    });
    expect(createResponse).toHaveBeenCalledOnce();
  });

  it("rejects an invalid structured response", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({ matchingSkills: ["TypeScript", 42] }),
    });

    await expect(identifyMatchingSkills(input)).rejects.toThrow(
      "Invalid profile comparison response.",
    );
  });
});

describe("identifyMissingSkills", () => {
  it("returns only normalized missing skills supported by required skills", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        missingSkills: [" AWS ", "aws", "Kubernetes", " "],
      }),
    });

    await expect(identifyMissingSkills(input)).resolves.toEqual({
      missingSkills: ["AWS"],
    });
    expect(createResponse).toHaveBeenCalledOnce();
  });

  it("rejects an invalid structured response", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({ missingSkills: ["AWS", 42] }),
    });

    await expect(identifyMissingSkills(input)).rejects.toThrow(
      "Invalid missing skills response.",
    );
  });
});

describe("identifyStrengths", () => {
  it("returns normalized strengths capped at five concise sentences", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        strengths: [
          " TypeScript experience directly supports the role's core requirement. ",
          "Building REST APIs demonstrates relevant backend experience.",
          "The current software engineering role aligns with the requested experience.",
          "Web API experience supports the job's product responsibilities.",
          "The professional summary demonstrates relevant software engineering focus.",
          "A sixth supported strength is excluded.",
          "typescript experience directly supports the role's core requirement.",
        ],
      }),
    });

    await expect(identifyStrengths(input)).resolves.toEqual({
      strengths: [
        "TypeScript experience directly supports the role's core requirement.",
        "Building REST APIs demonstrates relevant backend experience.",
        "The current software engineering role aligns with the requested experience.",
        "Web API experience supports the job's product responsibilities.",
        "The professional summary demonstrates relevant software engineering focus.",
      ],
    });
    expect(createResponse).toHaveBeenCalledOnce();
  });

  it("allows fewer strengths when the evidence is insufficient", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        strengths: [
          "TypeScript experience directly supports the role's core requirement.",
        ],
      }),
    });

    await expect(identifyStrengths(input)).resolves.toEqual({
      strengths: [
        "TypeScript experience directly supports the role's core requirement.",
      ],
    });
  });

  it("rejects an invalid structured response", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({ strengths: ["TypeScript", 42] }),
    });

    await expect(identifyStrengths(input)).rejects.toThrow(
      "Invalid strengths response.",
    );
  });
});

describe("identifyWeaknesses", () => {
  it("returns normalized weaknesses capped at five concise sentences", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        weaknesses: [
          " AWS is required but is not demonstrated in the Master CV. ",
          "The expected cloud responsibilities are not supported by the documented experience.",
          "The requested deployment experience is not represented in the Master CV.",
          "The role expects infrastructure knowledge that the Master CV does not demonstrate.",
          "The job requires cloud tooling beyond the documented TypeScript experience.",
          "A sixth supported weakness is excluded.",
          "aws is required but is not demonstrated in the master cv.",
        ],
      }),
    });

    await expect(identifyWeaknesses(input)).resolves.toEqual({
      weaknesses: [
        "AWS is required but is not demonstrated in the Master CV.",
        "The expected cloud responsibilities are not supported by the documented experience.",
        "The requested deployment experience is not represented in the Master CV.",
        "The role expects infrastructure knowledge that the Master CV does not demonstrate.",
        "The job requires cloud tooling beyond the documented TypeScript experience.",
      ],
    });
    expect(createResponse).toHaveBeenCalledOnce();
  });

  it("allows an empty weakness list when the evidence is insufficient", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({ weaknesses: [] }),
    });

    await expect(identifyWeaknesses(input)).resolves.toEqual({
      weaknesses: [],
    });
  });

  it("rejects an invalid structured response", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({ weaknesses: ["AWS", 42] }),
    });

    await expect(identifyWeaknesses(input)).rejects.toThrow(
      "Invalid weaknesses response.",
    );
  });
});

describe("evaluateProfileAlignment", () => {
  const comparison = {
    matchingSkills: ["TypeScript", "REST APIs"],
    missingSkills: ["AWS"],
    strengths: [
      "TypeScript and REST API experience directly support core role requirements.",
    ],
    weaknesses: ["AWS is required but is not demonstrated in the Master CV."],
  };

  it("returns a validated score and normalized internal reasoning", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        alignmentScore: 72,
        alignmentReasoning:
          " Strong backend evidence supports the role, but the missing AWS requirement limits readiness. ",
      }),
    });

    await expect(evaluateProfileAlignment(input, comparison)).resolves.toEqual({
      alignmentScore: 72,
      alignmentReasoning:
        "Strong backend evidence supports the role, but the missing AWS requirement limits readiness.",
    });

    const request = createResponse.mock.calls[0]?.[0];
    expect(request.input[1].content[0].text).toBe(
      JSON.stringify({ ...input, comparison }),
    );
  });

  it.each([-1, 101, 72.5])(
    "rejects an invalid alignment score: %s",
    async (alignmentScore) => {
      createResponse.mockResolvedValue({
        output_text: JSON.stringify({
          alignmentScore,
          alignmentReasoning: "Supported reasoning.",
        }),
      });

      await expect(evaluateProfileAlignment(input, comparison)).rejects.toThrow(
        "Invalid profile alignment response.",
      );
    },
  );

  it("rejects empty alignment reasoning", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        alignmentScore: 72,
        alignmentReasoning: " ",
      }),
    });

    await expect(evaluateProfileAlignment(input, comparison)).rejects.toThrow(
      "Invalid profile alignment response.",
    );
  });
});

describe("generateRecommendation", () => {
  const comparison = {
    matchingSkills: ["TypeScript", "REST APIs"],
    missingSkills: ["AWS"],
    strengths: [
      "TypeScript and REST API experience directly support core role requirements.",
    ],
    weaknesses: ["AWS is required but is not demonstrated in the Master CV."],
    alignmentScore: 72,
    alignmentReasoning:
      "Relevant backend evidence supports the role, but the missing AWS requirement limits readiness.",
  };

  it("returns a validated and normalized recommendation", async () => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify({
        recommendation:
          " Good opportunity.   Improve your CV before applying so it reflects the supported experience more clearly. ",
      }),
    });

    await expect(generateRecommendation(input, comparison)).resolves.toEqual({
      recommendation:
        "Good opportunity. Improve your CV before applying so it reflects the supported experience more clearly.",
    });

    const request = createResponse.mock.calls[0]?.[0];
    expect(request.input[1].content[0].text).toBe(
      JSON.stringify({ ...input, comparison }),
    );
    expect(request.text.format).toMatchObject({
      type: "json_schema",
      name: "profile_recommendation",
      strict: true,
    });
  });

  it.each([
    { recommendation: "" },
    { recommendation: 42 },
    {
      recommendation:
        "First sentence. Second sentence. Third sentence. Fourth sentence.",
    },
  ])("rejects an invalid recommendation: $recommendation", async (output) => {
    createResponse.mockResolvedValue({
      output_text: JSON.stringify(output),
    });

    await expect(generateRecommendation(input, comparison)).rejects.toThrow(
      "Invalid profile recommendation response.",
    );
  });
});
