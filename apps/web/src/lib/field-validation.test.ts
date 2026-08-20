import { describe, expect, it } from "vitest";
import type { ApplicationInput } from "../types/application";
import type { CoverLetter } from "../types/cover-letter";
import type { MasterCvInput } from "../types/master-cv";
import {
  getApplicationFieldErrors,
  getCoverLetterFieldErrors,
  getMasterCvFieldErrors,
  isValidDate,
  isValidEmail,
  isValidPhone,
  isValidUrl,
} from "./field-validation";

const validMasterCv: MasterCvInput = {
  fullName: "Taylor Smith",
  email: "taylor@example.com",
  phone: "+1 555 0100",
  location: "New York",
  linkedin: "https://linkedin.com/in/taylor",
  portfolio: "https://example.com",
  professionalSummary: "Software engineer",
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
  education: [
    {
      institution: "Example University",
      degree: "BSc",
      fieldOfStudy: null,
      startDate: "2016",
      endDate: "2020",
      description: null,
    },
  ],
  skills: ["TypeScript"],
  languages: [{ name: "English", proficiency: "Fluent" }],
  certifications: [
    {
      name: "AWS",
      issuer: "Amazon",
      issueDate: "2022",
      credentialUrl: "https://example.com/credential",
    },
  ],
  personalProjects: [
    {
      name: "Career Copilot",
      description: "AI career assistant",
      technologies: "TypeScript",
      url: "https://example.com/career-copilot",
    },
  ],
};

describe("typed field validators", () => {
  it("accepts valid emails, phones, URLs, and dates", () => {
    expect(isValidEmail("taylor@example.com")).toBe(true);
    expect(isValidPhone("+1 555 0100")).toBe(true);
    expect(isValidPhone("(555) 123-4567")).toBe(true);
    expect(isValidUrl("https://example.com/job")).toBe(true);
    expect(isValidUrl("linkedin.com/in/taylor")).toBe(true);
    expect(isValidDate("2016")).toBe(true);
    expect(isValidDate("2020-01")).toBe(true);
    expect(isValidDate("August 7, 2026")).toBe(true);
  });

  it("rejects clearly invalid typed values without blocking normal text", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidPhone("hello")).toBe(false);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidUrl("not a url")).toBe(false);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidDate("hello")).toBe(false);
    expect(isValidDate("2020-13")).toBe(false);
  });
});

describe("getMasterCvFieldErrors", () => {
  it("accepts a complete valid Master CV", () => {
    expect(getMasterCvFieldErrors(validMasterCv)).toEqual({});
  });

  it("requires identity text and skills", () => {
    expect(
      getMasterCvFieldErrors({
        ...validMasterCv,
        fullName: "   ",
        email: "",
        professionalSummary: " ",
        skills: [],
      }),
    ).toEqual({
      fullName: "Full name is required.",
      email: "Email is required.",
      professionalSummary: "Professional summary is required.",
      skills: "Enter at least one skill.",
    });
  });

  it("validates typed optional fields only when a value is provided", () => {
    expect(
      getMasterCvFieldErrors({
        ...validMasterCv,
        phone: null,
        linkedin: null,
        portfolio: "",
      }),
    ).toEqual({});
    expect(
      getMasterCvFieldErrors({
        ...validMasterCv,
        email: "not-an-email",
        phone: "abc",
        linkedin: "not a url",
        personalProjects: [
          {
            name: "Career Copilot",
            description: "AI career assistant",
            technologies: "C++ / TypeScript",
            url: "bad url",
          },
        ],
        experience: [
          {
            ...validMasterCv.experience[0],
            startDate: "not-a-date",
          },
        ],
      }),
    ).toMatchObject({
      email: "Enter a valid email address.",
      phone: "Enter a valid phone number.",
      linkedin: "Enter a valid URL.",
      "personalProjects.0.url": "Enter a valid URL.",
      "experience.0.startDate": "Enter a valid date.",
    });
  });
});

describe("getApplicationFieldErrors", () => {
  const validApplication: ApplicationInput = {
    companyName: "Acme",
    jobTitle: "Software Engineer",
    location: "Remote",
    jobUrl: "https://example.com/job",
    jobDescription: "Build web products.",
  };

  it("requires company, title, and description and validates an optional URL", () => {
    expect(getApplicationFieldErrors(validApplication)).toEqual({});
    expect(
      getApplicationFieldErrors({
        ...validApplication,
        companyName: " ",
        jobTitle: "",
        jobUrl: "not a url",
        jobDescription: "   ",
      }),
    ).toEqual({
      companyName: "Company name is required.",
      jobTitle: "Job title is required.",
      jobUrl: "Enter a valid URL.",
      jobDescription: "Job description is required.",
    });
  });

  it("allows an empty optional job URL", () => {
    expect(
      getApplicationFieldErrors({ ...validApplication, jobUrl: "" }),
    ).toEqual({});
  });
});

describe("getCoverLetterFieldErrors", () => {
  const validCoverLetter: CoverLetter = {
    candidateName: "Taylor Smith",
    email: "taylor@example.com",
    phone: "+1 555 0100",
    date: "August 7, 2026",
    companyName: "Acme",
    greeting: "Dear Hiring Manager,",
    introduction: "I am writing to apply.",
    professionalValue: "I build APIs.",
    motivation: "I want to join the team.",
    closing: "Thank you.",
    signature: "Taylor Smith",
  };

  it("accepts a valid Cover Letter and allows empty body text", () => {
    expect(getCoverLetterFieldErrors(validCoverLetter)).toEqual({});
    expect(
      getCoverLetterFieldErrors({
        ...validCoverLetter,
        greeting: "",
        introduction: "",
        professionalValue: "",
        motivation: "",
        closing: "",
      }),
    ).toEqual({});
  });

  it("validates identity email, phone, and date", () => {
    expect(
      getCoverLetterFieldErrors({
        ...validCoverLetter,
        email: "bad",
        phone: "abc",
        date: "tomorrow",
      }),
    ).toEqual({
      email: "Enter a valid email address.",
      phone: "Enter a valid phone number.",
      date: "Enter a valid date.",
    });
  });
});
