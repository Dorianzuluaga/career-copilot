import { describe, expect, it, vi } from "vitest";

vi.mock("../repositories/master-cv.repository.js", () => ({
  createMasterCv: vi.fn(),
  findMasterCvByUserId: vi.fn(),
  updateMasterCv: vi.fn(),
}));

import { MasterCvError, validateMasterCvInput } from "./master-cv.service.js";

const validInput = {
  fullName: "Taylor Smith",
  email: "taylor@example.com",
  phone: null,
  location: null,
  linkedin: null,
  portfolio: null,
  professionalSummary: "Software engineer",
  experience: [
    {
      jobTitle: "Software Engineer",
      company: "TechNova Solutions",
      location: null,
      startDate: null,
      endDate: null,
      current: true,
      description: "Built APIs",
    },
    {
      jobTitle: "Editor",
      company: "BigTrail Magazine",
      location: null,
      startDate: null,
      endDate: null,
      current: false,
      description: "Wrote features",
    },
  ],
  education: [
    {
      institution: "Example University",
      degree: "DAW",
      fieldOfStudy: null,
      startDate: null,
      endDate: null,
      description: null,
    },
    {
      institution: "Bootcamp",
      degree: "Full-Stack AI",
      fieldOfStudy: null,
      startDate: null,
      endDate: null,
      description: null,
    },
  ],
  skills: ["TypeScript"],
  languages: [],
  certifications: [],
};

describe("validateMasterCvInput", () => {
  it("accepts a Master CV without personal projects", () => {
    const result = validateMasterCvInput(validInput);

    expect(result.personalProjects).toBeUndefined();
    expect(result.experience).toEqual(validInput.experience);
    expect(result.education).toEqual(validInput.education);
  });

  it("accepts an empty personal projects collection", () => {
    const result = validateMasterCvInput({
      ...validInput,
      personalProjects: [],
    });

    expect(result.personalProjects).toEqual([]);
  });

  it("preserves experience, education, and personal project order", () => {
    const personalProjects = [
      {
        name: "Career Copilot",
        description: "AI career assistant",
        technologies: "TypeScript",
        url: "https://example.com/career-copilot",
      },
      {
        name: "AI Developer Copilot",
        description: "Developer assistant",
        technologies: null,
        url: null,
      },
    ];

    const result = validateMasterCvInput({
      ...validInput,
      personalProjects,
    });

    expect(result.experience.map((item) => item.company)).toEqual([
      "TechNova Solutions",
      "BigTrail Magazine",
    ]);
    expect(result.education.map((item) => item.degree)).toEqual([
      "DAW",
      "Full-Stack AI",
    ]);
    expect(result.personalProjects?.map((item) => item.name)).toEqual([
      "Career Copilot",
      "AI Developer Copilot",
    ]);
  });

  it("rejects invalid personal projects", () => {
    expect(() =>
      validateMasterCvInput({
        ...validInput,
        personalProjects: [{ name: "Career Copilot" }],
      }),
    ).toThrow(MasterCvError);
  });

  it("rejects invalid email, phone, URL, and date values", () => {
    expect(() =>
      validateMasterCvInput({ ...validInput, email: "not-an-email" }),
    ).toThrow("email must be a valid email address.");
    expect(() =>
      validateMasterCvInput({ ...validInput, phone: "hello" }),
    ).toThrow("phone must be a valid phone number.");
    expect(() =>
      validateMasterCvInput({
        ...validInput,
        linkedin: "javascript:alert(1)",
      }),
    ).toThrow("linkedin must be a valid URL.");
    expect(() =>
      validateMasterCvInput({
        ...validInput,
        experience: [
          {
            ...validInput.experience[0],
            startDate: "not-a-date",
          },
        ],
      }),
    ).toThrow("experience[0].startDate must be a valid date.");
  });

  it("accepts optional typed fields and existing date formats", () => {
    const result = validateMasterCvInput({
      ...validInput,
      phone: "+1 555 0100",
      linkedin: "linkedin.com/in/taylor",
      portfolio: "https://example.com",
      experience: [
        {
          ...validInput.experience[0],
          startDate: "2020-01",
          endDate: "Present",
        },
      ],
      education: [
        {
          ...validInput.education[0],
          startDate: "2016",
          endDate: "2020",
        },
      ],
    });

    expect(result.phone).toBe("+1 555 0100");
    expect(result.linkedin).toBe("linkedin.com/in/taylor");
    expect(result.experience[0].startDate).toBe("2020-01");
    expect(result.education[0].startDate).toBe("2016");
  });
});
