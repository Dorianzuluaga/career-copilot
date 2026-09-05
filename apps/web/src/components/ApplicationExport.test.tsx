import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "../context/LocaleProvider";
import { writeStoredLocale } from "../i18n/storage";
import type { CoverLetter } from "../types/cover-letter";
import type { OptimizedCv } from "../types/optimized-cv";
import { ApplicationCoverLetter } from "./ApplicationCoverLetter";
import {
  ApplicationExport,
  ExportPreviewPanel,
  exportRequestsForSelection,
} from "./ApplicationExport";
import { ApplicationOptimizedCv } from "./ApplicationOptimizedCv";
import { writeStoredPresentationLanguage } from "../services/presentation-language";

const optimizedCv: OptimizedCv = {
  fullName: "Taylor Smith",
  professionalTitle: null,
  email: "taylor@example.com",
  phone: null,
  location: "Berlin",
  linkedin: null,
  website: null,
  professionalSummary: "TypeScript engineer building APIs.",
  experience: [
    {
      jobTitle: "Software Engineer",
      company: "Example",
      location: null,
      startDate: "2022-01",
      endDate: null,
      current: true,
      description: "Built REST APIs with TypeScript.",
    },
  ],
  education: [],
  skills: ["TypeScript"],
  languages: [],
  certifications: [],
  personalProjects: [],
  workingLanguage: "en",
};

const coverLetter: CoverLetter = {
  candidateName: "Taylor Smith",
  email: "taylor@example.com",
  phone: "+1 555 0100",
  date: "August 7, 2026",
  companyName: "Acme",
  greeting: "Dear Hiring Manager,",
  introduction: "I am writing to apply for the Software Engineer role at Acme.",
  professionalValue:
    "My experience building TypeScript APIs aligns with your requirements.",
  motivation:
    "I am interested in contributing to Acme's product engineering team.",
  closing: "Thank you for your consideration. I am available for an interview.",
  signature: "Taylor Smith",
  workingLanguage: "es",
};

function createMemoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
  };
}

function renderExport(ui: Parameters<typeof renderToStaticMarkup>[0]) {
  return renderToStaticMarkup(<LocaleProvider>{ui}</LocaleProvider>);
}

describe("export presentation language UX", () => {
  it("sends one Presentation Language for both selected documents", () => {
    expect(
      exportRequestsForSelection(
        { optimizedCv: true, coverLetter: true },
        "fr",
      ),
    ).toEqual([
      { document: "optimized-cv", presentationLanguage: "fr" },
      { document: "cover-letter", presentationLanguage: "fr" },
    ]);
    expect(
      exportRequestsForSelection(
        { optimizedCv: true, coverLetter: false },
        "en",
      ),
    ).toEqual([{ document: "optimized-cv", presentationLanguage: "en" }]);
  });

  it("renders the Presentation Language selector only in Export", () => {
    const exportMarkup = renderExport(
      <ApplicationExport
        applicationId="application-id"
        coverLetter={coverLetter}
        optimizedCv={optimizedCv}
      />,
    );
    const optimizedCvMarkup = renderExport(
      <ApplicationOptimizedCv
        errorMessage={null}
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
        optimizedCv={optimizedCv}
      />,
    );
    const coverLetterMarkup = renderExport(
      <ApplicationCoverLetter
        coverLetter={coverLetter}
        errorMessage={null}
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
      />,
    );

    expect(exportMarkup).toContain("Idioma de presentación");
    expect(exportMarkup).toContain(
      "Este idioma se aplica tanto al CV optimizado como a la carta de presentación.",
    );
    expect(exportMarkup).toContain(">Español<");
    expect(exportMarkup).toContain(">English<");
    expect(exportMarkup).toContain(">Français<");
    expect(exportMarkup).toContain('aria-label="Idioma de presentación"');
    expect(exportMarkup).not.toContain("TypeScript engineer building APIs.");
    expect(exportMarkup).toContain("Preparando la vista previa…");
    expect(optimizedCvMarkup).not.toContain("Idioma de presentación");
    expect(coverLetterMarkup).not.toContain("Idioma de presentación");
  });

  it("defaults Presentation Language independently from Working Language and stored UI locale", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("localStorage", storage);
    writeStoredLocale("es");
    writeStoredPresentationLanguage("fr");

    const markup = renderExport(
      <ApplicationExport
        applicationId="application-id"
        coverLetter={coverLetter}
        optimizedCv={optimizedCv}
      />,
    );

    expect(markup).toContain('aria-label="Idioma de presentación"');
    expect(markup).toContain(
      '<option value="fr" selected="">Français</option>',
    );
    expect(markup).not.toContain(
      '<option value="es" selected="">Español</option>',
    );
    expect(markup).not.toContain('data-field="workingLanguage"');
    vi.unstubAllGlobals();
  });

  it("renders Export Preview from the selected Presentation Language view model", () => {
    const markup = renderExport(
      <ExportPreviewPanel
        applicationId="application-id"
        preview={{
          document: "optimized-cv",
          presentationLanguage: "fr",
          data: optimizedCv,
        }}
      />,
    );

    expect(markup).toContain('data-presentation-language="fr"');
    expect(markup).toContain("TypeScript engineer building APIs.");
    expect(markup).toContain("Taylor Smith");
    expect(markup).not.toContain("Dear Hiring Manager,");
  });

  it("keeps Cover Letter preview on the same Presentation Language", () => {
    const markup = renderExport(
      <ExportPreviewPanel
        applicationId="application-id"
        preview={{
          document: "cover-letter",
          presentationLanguage: "fr",
          data: coverLetter,
        }}
      />,
    );

    expect(markup).toContain('data-presentation-language="fr"');
    expect(markup).toContain("Dear Hiring Manager,");
    expect(markup).not.toContain("TypeScript engineer building APIs.");
  });
});
