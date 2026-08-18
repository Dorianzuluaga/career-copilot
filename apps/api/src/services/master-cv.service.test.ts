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
});
