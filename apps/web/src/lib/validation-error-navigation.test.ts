import { describe, expect, it, vi } from "vitest";
import { getMasterCvFieldErrors } from "./field-validation";
import {
  firstInvalidFieldKey,
  focusFirstInvalidField,
  getFieldLabel,
  getValidationToastMessage,
} from "./validation-error-navigation";

describe("getFieldLabel", () => {
  it("uses readable names for identity and nested collection fields", () => {
    expect(getFieldLabel("phone")).toBe("Phone");
    expect(getFieldLabel("jobUrl")).toBe("Job URL");
    expect(getFieldLabel("experience.0.startDate")).toBe(
      "Experience 1 start date",
    );
    expect(getFieldLabel("personalProjects.1.url")).toBe("Project 2 URL");
    expect(getFieldLabel("certifications.0.credentialUrl")).toBe(
      "Certification 1 credential URL",
    );
  });
});

describe("getValidationToastMessage", () => {
  it("identifies a single invalid field", () => {
    expect(
      getValidationToastMessage({ phone: "Enter a valid phone number." }),
    ).toBe("Changes could not be saved. Phone has a validation error.");
  });

  it("briefly identifies multiple invalid fields", () => {
    expect(
      getValidationToastMessage({
        phone: "Enter a valid phone number.",
        linkedin: "Enter a valid URL.",
      }),
    ).toBe(
      "Changes could not be saved. Phone and LinkedIn have validation errors.",
    );
    expect(
      getValidationToastMessage({
        fullName: "Full name is required.",
        email: "Email is required.",
        professionalSummary: "Professional summary is required.",
        skills: "Enter at least one skill.",
      }),
    ).toBe(
      "Changes could not be saved. Full name, Email, Professional summary, and Skills have validation errors.",
    );
  });

  it("summarizes long field lists", () => {
    expect(
      getValidationToastMessage({
        phone: "Enter a valid phone number.",
        linkedin: "Enter a valid URL.",
        portfolio: "Enter a valid URL.",
        "experience.0.startDate": "Enter a valid date.",
        "education.0.endDate": "Enter a valid date.",
      }),
    ).toBe(
      "Changes could not be saved. Phone, LinkedIn, Portfolio, and 2 more fields have validation errors.",
    );
  });

  it("returns null when there are no field errors", () => {
    expect(getValidationToastMessage({})).toBeNull();
  });
});

describe("firstInvalidFieldKey", () => {
  it("keeps the first remaining invalid field after an earlier error is fixed", () => {
    const remaining = {
      linkedin: "Enter a valid URL.",
      "experience.0.startDate": "Enter a valid date.",
    };
    expect(firstInvalidFieldKey(remaining)).toBe("linkedin");
  });

  it("moves to the next remaining Master CV field after the first error is fixed", () => {
    const errors = getMasterCvFieldErrors({
      fullName: "Taylor Smith",
      email: "taylor@example.com",
      phone: "abc",
      location: null,
      linkedin: "not a url",
      portfolio: null,
      professionalSummary: "Software engineer",
      experience: [],
      education: [],
      skills: ["TypeScript"],
      languages: [],
      certifications: [],
    });
    expect(firstInvalidFieldKey(errors)).toBe("phone");
    const remaining = { ...errors };
    delete remaining.phone;
    expect(firstInvalidFieldKey(remaining)).toBe("linkedin");
  });
});

describe("focusFirstInvalidField", () => {
  it("scrolls to and focuses the first invalid field", () => {
    const phone = {
      scrollIntoView: vi.fn(),
      focus: vi.fn(),
    };
    const linkedin = {
      scrollIntoView: vi.fn(),
      focus: vi.fn(),
    };
    const querySelector = vi.fn((selector: string) => {
      if (selector === '[data-field="phone"]') return phone;
      if (selector === '[data-field="linkedin"]') return linkedin;
      return null;
    });

    vi.stubGlobal("document", { querySelector });
    try {
      focusFirstInvalidField({
        phone: "Enter a valid phone number.",
        linkedin: "Enter a valid URL.",
      });

      expect(querySelector).toHaveBeenCalledWith('[data-field="phone"]');
      expect(phone.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });
      expect(phone.focus).toHaveBeenCalledWith({ preventScroll: true });
      expect(linkedin.focus).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
