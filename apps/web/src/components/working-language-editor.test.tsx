import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "../context/LocaleProvider";
import type { CoverLetter } from "../types/cover-letter";
import type { OptimizedCv } from "../types/optimized-cv";
import { ApplicationCoverLetter } from "./ApplicationCoverLetter";
import { ApplicationOptimizedCv } from "./ApplicationOptimizedCv";

const optimizedCv: OptimizedCv = {
  fullName: "Taylor Smith",
  professionalTitle: null,
  email: "taylor@example.com",
  phone: null,
  location: null,
  linkedin: null,
  website: null,
  professionalSummary: "Software engineer.",
  experience: [],
  education: [],
  skills: ["TypeScript"],
  languages: [],
  certifications: [],
  personalProjects: [],
  workingLanguage: null,
};

const coverLetter: CoverLetter = {
  candidateName: "Taylor Smith",
  email: "taylor@example.com",
  phone: null,
  date: "2026-09-04",
  companyName: "Acme",
  greeting: "Hello,",
  introduction: "Introduction",
  professionalValue: "Value",
  motivation: "Motivation",
  closing: "Regards,",
  signature: "Taylor Smith",
  workingLanguage: null,
};

function renderEditor(node: ReactNode) {
  return renderToStaticMarkup(<LocaleProvider>{node}</LocaleProvider>);
}

function hasWorkingLanguageControl(markup: string) {
  return (
    markup.includes('data-field="workingLanguage"') ||
    markup.includes('name="workingLanguage"') ||
    markup.includes('id="workingLanguage"')
  );
}

describe("working language editor safety", () => {
  it("renders a legacy Optimized CV with null Working Language and no language editor control", () => {
    const markup = renderEditor(
      <ApplicationOptimizedCv
        errorMessage={null}
        initialIsEditing
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
        optimizedCv={optimizedCv}
      />,
    );

    expect(markup).toContain("Taylor Smith");
    expect(markup).toContain("Software engineer.");
    expect(hasWorkingLanguageControl(markup)).toBe(false);
  });

  it("renders a legacy Cover Letter with null Working Language and no language editor control", () => {
    const markup = renderEditor(
      <ApplicationCoverLetter
        coverLetter={coverLetter}
        errorMessage={null}
        initialIsEditing
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
      />,
    );

    expect(markup).toContain("Taylor Smith");
    expect(markup).toContain("Hello,");
    expect(hasWorkingLanguageControl(markup)).toBe(false);
  });

  it("renders known Working Language documents without exposing a language editor", () => {
    const optimizedMarkup = renderEditor(
      <ApplicationOptimizedCv
        errorMessage={null}
        initialIsEditing
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        optimizedCv={{ ...optimizedCv, workingLanguage: "fr" }}
      />,
    );
    const coverLetterMarkup = renderEditor(
      <ApplicationCoverLetter
        coverLetter={{ ...coverLetter, workingLanguage: "es" }}
        errorMessage={null}
        initialIsEditing
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
      />,
    );

    expect(hasWorkingLanguageControl(optimizedMarkup)).toBe(false);
    expect(hasWorkingLanguageControl(coverLetterMarkup)).toBe(false);
  });
});
