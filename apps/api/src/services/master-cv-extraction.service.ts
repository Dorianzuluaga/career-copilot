import { readFile } from "node:fs/promises";
import OpenAI from "openai";
import type { MasterCvExtraction } from "../types/master-cv.js";

const nullableString = { type: ["string", "null"] } as const;

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "personalInformation",
    "professionalSummary",
    "experience",
    "education",
    "skills",
    "languages",
    "certifications",
    "personalProjects",
  ],
  properties: {
    personalInformation: {
      type: "object",
      additionalProperties: false,
      required: [
        "fullName",
        "professionalTitle",
        "email",
        "phone",
        "location",
        "linkedin",
        "website",
      ],
      properties: {
        fullName: nullableString,
        professionalTitle: nullableString,
        email: nullableString,
        phone: nullableString,
        location: nullableString,
        linkedin: nullableString,
        website: nullableString,
      },
    },
    professionalSummary: nullableString,
    experience: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "jobTitle",
          "company",
          "location",
          "startDate",
          "endDate",
          "current",
          "description",
        ],
        properties: {
          jobTitle: nullableString,
          company: nullableString,
          location: nullableString,
          startDate: nullableString,
          endDate: nullableString,
          current: { type: ["boolean", "null"] },
          description: nullableString,
        },
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "institution",
          "degree",
          "fieldOfStudy",
          "startDate",
          "endDate",
          "description",
        ],
        properties: {
          institution: nullableString,
          degree: nullableString,
          fieldOfStudy: nullableString,
          startDate: nullableString,
          endDate: nullableString,
          description: nullableString,
        },
      },
    },
    skills: { type: "array", items: { type: "string" } },
    languages: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "proficiency"],
        properties: {
          name: nullableString,
          proficiency: nullableString,
        },
      },
    },
    certifications: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "issuer", "issueDate", "credentialUrl"],
        properties: {
          name: nullableString,
          issuer: nullableString,
          issueDate: nullableString,
          credentialUrl: nullableString,
        },
      },
    },
    personalProjects: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "description", "technologies", "url"],
        properties: {
          name: nullableString,
          description: nullableString,
          technologies: nullableString,
          url: nullableString,
        },
      },
    },
  },
} as const;

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasNullableStrings(
  value: unknown,
  fields: string[],
): value is Record<string, unknown> {
  return (
    isRecord(value) && fields.every((field) => isNullableString(value[field]))
  );
}

export function isMasterCvExtraction(
  value: unknown,
): value is MasterCvExtraction {
  if (!isRecord(value)) return false;
  const data = value;
  const personal = data.personalInformation;
  const experienceFields = [
    "jobTitle",
    "company",
    "location",
    "startDate",
    "endDate",
    "description",
  ];

  return (
    hasNullableStrings(personal, [
      "fullName",
      "professionalTitle",
      "email",
      "phone",
      "location",
      "linkedin",
      "website",
    ]) &&
    !("photo" in personal) &&
    !("profilePhoto" in personal) &&
    !("profilePhotoObjectKey" in personal) &&
    !("profilePhotoAssetId" in personal) &&
    !("photo" in data) &&
    isNullableString(data.professionalSummary) &&
    Array.isArray(data.experience) &&
    data.experience.every(
      (item) =>
        hasNullableStrings(item, experienceFields) &&
        (item.current === null || typeof item.current === "boolean"),
    ) &&
    Array.isArray(data.education) &&
    data.education.every((item) =>
      hasNullableStrings(item, [
        "institution",
        "degree",
        "fieldOfStudy",
        "startDate",
        "endDate",
        "description",
      ]),
    ) &&
    Array.isArray(data.skills) &&
    data.skills.every((skill) => typeof skill === "string") &&
    Array.isArray(data.languages) &&
    data.languages.every((item) =>
      hasNullableStrings(item, ["name", "proficiency"]),
    ) &&
    Array.isArray(data.certifications) &&
    data.certifications.every((item) =>
      hasNullableStrings(item, [
        "name",
        "issuer",
        "issueDate",
        "credentialUrl",
      ]),
    ) &&
    Array.isArray(data.personalProjects) &&
    data.personalProjects.every((item) =>
      hasNullableStrings(item, ["name", "description", "technologies", "url"]),
    )
  );
}

export async function extractMasterCv(
  filePath: string,
  originalName: string,
): Promise<MasterCvExtraction> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI is not configured.");

  const file = await readFile(filePath);
  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_file",
            filename: originalName,
            file_data: `data:application/pdf;base64,${file.toString("base64")}`,
          },
          {
            type: "input_text",
            text: [
              "Extract only information explicitly present in this CV.",
              "Never infer or invent information.",
              "Use null for unknown scalar values and an empty array when a section has no entries.",
              "Preserve the source wording where possible.",
              "Extract professionalTitle only when the uploaded CV presents a professional headline, typically under the name.",
              "Do not copy an Experience jobTitle into professionalTitle unless that text is presented as the candidate's professional title independently of a specific employment entry.",
              "Extract linkedin only for LinkedIn URLs.",
              "Extract website for a personal website or other non-LinkedIn professional profile URL when present in the source document.",
              "If several non-LinkedIn URLs are present, extract the one presented as the candidate's website or portfolio. Do not invent a URL. Do not concatenate URLs. Do not place a LinkedIn URL in website.",
              "Preserve the order in which Experience, Education, and Personal Projects appear in the document.",
              "Extract Personal Projects only when they are explicitly present.",
              "Never invent projects or project information.",
              "If no Personal Projects are present, return an empty personalProjects array.",
            ].join(" "),
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "master_cv_extraction",
        strict: true,
        schema: extractionSchema,
      },
    },
  });

  const parsed: unknown = JSON.parse(response.output_text);
  if (!isMasterCvExtraction(parsed))
    throw new Error("Invalid extraction response.");
  return parsed;
}
