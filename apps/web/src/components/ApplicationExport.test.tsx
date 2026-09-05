import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "../context/LocaleProvider";
import type { Locale } from "../i18n/locales";
import { writeStoredLocale } from "../i18n/storage";
import type { CoverLetter } from "../types/cover-letter";
import type {
  ExportDocumentType,
  ExportPreviewResponse,
  OptimizedCvDocumentChrome,
} from "../types/export";
import type { OptimizedCv } from "../types/optimized-cv";
import {
  ApplicationCoverLetter,
  CoverLetterDocument,
} from "./ApplicationCoverLetter";
import {
  ApplicationExport,
  createExportPreviewCache,
  ExportPreviewPanel,
  exportRequestsForSelection,
  readCachedExportPreview,
  shouldInvalidateExportPreviewCache,
  type ExportPreviewCache,
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

const frenchOptimizedCvChrome: OptimizedCvDocumentChrome = {
  professionalSummary: "Résumé professionnel",
  experience: "Expérience",
  education: "Formation",
  skills: "Compétences",
  languages: "Langues",
  certifications: "Certifications",
  personalProjects: "Projets personnels",
  present: "Aujourd'hui",
  openProject: "Ouvrir le projet",
};

const englishOptimizedCvChrome: OptimizedCvDocumentChrome = {
  professionalSummary: "Professional summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  languages: "Languages",
  certifications: "Certifications",
  personalProjects: "Personal projects",
  present: "Present",
  openProject: "Open project",
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
        previewCache={createExportPreviewCache()}
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
        previewCache={createExportPreviewCache()}
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
          data: {
            ...optimizedCv,
            personalProjects: [
              {
                name: "Career Copilot",
                description: "Job-specific CV workspace.",
                technologies: "TypeScript",
                url: "https://example.com/career-copilot",
              },
            ],
          },
          chrome: frenchOptimizedCvChrome,
        }}
      />,
    );

    expect(markup).toContain('data-presentation-language="fr"');
    expect(markup).toContain("TypeScript engineer building APIs.");
    expect(markup).toContain("Taylor Smith");
    expect(markup).toContain("Résumé professionnel");
    expect(markup).toContain("Expérience");
    expect(markup).toContain("Aujourd&#x27;hui");
    expect(markup).toContain("Ouvrir le projet");
    expect(markup).not.toContain("Resumen profesional");
    expect(markup).not.toContain("Actualidad");
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
          chrome: { formattedDate: "7 août 2026" },
        }}
      />,
    );

    expect(markup).toContain('data-presentation-language="fr"');
    expect(markup).toContain("Dear Hiring Manager,");
    expect(markup).toContain("7 août 2026");
    expect(markup).not.toContain("August 7, 2026");
    expect(markup).not.toContain("TypeScript engineer building APIs.");
  });

  it("keeps document chrome on Presentation Language when UI locale differs", () => {
    const markup = renderExport(
      <ExportPreviewPanel
        applicationId="application-id"
        preview={{
          document: "optimized-cv",
          presentationLanguage: "en",
          data: optimizedCv,
          chrome: englishOptimizedCvChrome,
        }}
      />,
    );

    expect(markup).toContain("Professional summary");
    expect(markup).toContain("Experience");
    expect(markup).toContain("Present");
    expect(markup).not.toContain("Resumen profesional");
    expect(markup).not.toContain("Experiencia");
    expect(markup).not.toContain("Actualidad");
  });

  it("formats workspace ISO Cover Letter dates from Working Language, not UI locale", () => {
    const markup = renderExport(
      <CoverLetterDocument
        coverLetter={{
          ...coverLetter,
          date: "2026-08-07",
          workingLanguage: "fr",
        }}
      />,
    );

    expect(markup).toContain("7 août 2026");
    expect(markup).not.toContain("2026-08-07");
    expect(markup).not.toContain("7 de agosto de 2026");
    expect(markup).not.toContain("August 7, 2026");
  });
});

describe("export preview cache", () => {
  const applicationId = "application-id";
  const cvPreview = {
    document: "optimized-cv" as const,
    presentationLanguage: "fr" as const,
    data: optimizedCv,
    chrome: frenchOptimizedCvChrome,
  };
  const coverLetterPreview = {
    document: "cover-letter" as const,
    presentationLanguage: "fr" as const,
    data: coverLetter,
    chrome: { formattedDate: "7 août 2026" },
  };
  const cvPreviewEn = {
    ...cvPreview,
    presentationLanguage: "en" as const,
    chrome: englishOptimizedCvChrome,
  };
  const coverLetterPreviewEn = {
    ...coverLetterPreview,
    presentationLanguage: "en" as const,
    chrome: { formattedDate: "August 7, 2026" },
  };

  async function loadPreview(
    cache: ExportPreviewCache,
    previousScope: {
      applicationId: string;
      presentationLanguage: Locale;
    } | null,
    application: string,
    document: ExportDocumentType,
    presentationLanguage: Locale,
    fetchPreview: (
      applicationId: string,
      document: ExportDocumentType,
      presentationLanguage: Locale,
    ) => Promise<ExportPreviewResponse>,
  ) {
    const scope = { applicationId: application, presentationLanguage };
    const cached = readCachedExportPreview(
      cache,
      previousScope,
      scope,
      document,
    );
    if (cached) {
      return { preview: cached, scope };
    }
    const preview = await fetchPreview(
      application,
      document,
      presentationLanguage,
    );
    cache.set(application, document, presentationLanguage, preview);
    return { preview, scope };
  }

  it("requests the selected document on first load", async () => {
    const cache = createExportPreviewCache();
    const fetchPreview = vi.fn().mockResolvedValue(cvPreview);

    const result = await loadPreview(
      cache,
      null,
      applicationId,
      "optimized-cv",
      "fr",
      fetchPreview,
    );

    expect(fetchPreview).toHaveBeenCalledTimes(1);
    expect(fetchPreview).toHaveBeenCalledWith(
      applicationId,
      "optimized-cv",
      "fr",
    );
    expect(result.preview).toEqual(cvPreview);
    expect(cache.get(applicationId, "optimized-cv", "fr")).toBe(cvPreview);
  });

  it("requests the other document once when switching tabs", async () => {
    const cache = createExportPreviewCache();
    const fetchPreview = vi
      .fn()
      .mockResolvedValueOnce(cvPreview)
      .mockResolvedValueOnce(coverLetterPreview);

    const first = await loadPreview(
      cache,
      null,
      applicationId,
      "optimized-cv",
      "fr",
      fetchPreview,
    );
    const second = await loadPreview(
      cache,
      first.scope,
      applicationId,
      "cover-letter",
      "fr",
      fetchPreview,
    );

    expect(fetchPreview).toHaveBeenCalledTimes(2);
    expect(fetchPreview.mock.calls).toEqual([
      [applicationId, "optimized-cv", "fr"],
      [applicationId, "cover-letter", "fr"],
    ]);
    expect(second.preview).toEqual(coverLetterPreview);
  });

  it("reuses the cached result when switching back", async () => {
    const cache = createExportPreviewCache();
    const fetchPreview = vi
      .fn()
      .mockResolvedValueOnce(cvPreview)
      .mockResolvedValueOnce(coverLetterPreview);

    const first = await loadPreview(
      cache,
      null,
      applicationId,
      "optimized-cv",
      "fr",
      fetchPreview,
    );
    const second = await loadPreview(
      cache,
      first.scope,
      applicationId,
      "cover-letter",
      "fr",
      fetchPreview,
    );
    const third = await loadPreview(
      cache,
      second.scope,
      applicationId,
      "optimized-cv",
      "fr",
      fetchPreview,
    );

    expect(fetchPreview).toHaveBeenCalledTimes(2);
    expect(third.preview).toBe(cvPreview);
  });

  it("does not issue duplicate preview requests for repeated CV and Cover Letter switching", async () => {
    const cache = createExportPreviewCache();
    const fetchPreview = vi
      .fn()
      .mockResolvedValueOnce(cvPreview)
      .mockResolvedValueOnce(coverLetterPreview);

    let scope: {
      applicationId: string;
      presentationLanguage: Locale;
    } | null = null;
    for (const document of [
      "optimized-cv",
      "cover-letter",
      "optimized-cv",
      "cover-letter",
      "optimized-cv",
    ] as const) {
      const result = await loadPreview(
        cache,
        scope,
        applicationId,
        document,
        "fr",
        fetchPreview,
      );
      scope = result.scope;
    }

    expect(fetchPreview).toHaveBeenCalledTimes(2);
  });

  it("does not reuse a previous language when Presentation Language changes", () => {
    const cache = createExportPreviewCache();
    cache.set(applicationId, "optimized-cv", "fr", cvPreview);
    cache.set(applicationId, "cover-letter", "fr", coverLetterPreview);

    expect(
      shouldInvalidateExportPreviewCache(
        { applicationId, presentationLanguage: "fr" },
        { applicationId, presentationLanguage: "en" },
      ),
    ).toBe(false);
    expect(
      readCachedExportPreview(
        cache,
        { applicationId, presentationLanguage: "fr" },
        { applicationId, presentationLanguage: "en" },
        "optimized-cv",
      ),
    ).toBeNull();
    expect(cache.get(applicationId, "optimized-cv", "fr")).toEqual(cvPreview);
    expect(cache.get(applicationId, "cover-letter", "fr")).toEqual(
      coverLetterPreview,
    );
  });

  it("fetches each document once after a language change and then reuses them", async () => {
    const cache = createExportPreviewCache();
    const fetchPreview = vi
      .fn()
      .mockResolvedValueOnce(cvPreview)
      .mockResolvedValueOnce(coverLetterPreview)
      .mockResolvedValueOnce(cvPreviewEn)
      .mockResolvedValueOnce(coverLetterPreviewEn);

    const cvFr = await loadPreview(
      cache,
      null,
      applicationId,
      "optimized-cv",
      "fr",
      fetchPreview,
    );
    const clFr = await loadPreview(
      cache,
      cvFr.scope,
      applicationId,
      "cover-letter",
      "fr",
      fetchPreview,
    );
    const cvEn = await loadPreview(
      cache,
      clFr.scope,
      applicationId,
      "optimized-cv",
      "en",
      fetchPreview,
    );
    const clEn = await loadPreview(
      cache,
      cvEn.scope,
      applicationId,
      "cover-letter",
      "en",
      fetchPreview,
    );
    await loadPreview(
      cache,
      clEn.scope,
      applicationId,
      "optimized-cv",
      "en",
      fetchPreview,
    );
    await loadPreview(
      cache,
      clEn.scope,
      applicationId,
      "cover-letter",
      "en",
      fetchPreview,
    );

    expect(fetchPreview).toHaveBeenCalledTimes(4);
    expect(fetchPreview.mock.calls).toEqual([
      [applicationId, "optimized-cv", "fr"],
      [applicationId, "cover-letter", "fr"],
      [applicationId, "optimized-cv", "en"],
      [applicationId, "cover-letter", "en"],
    ]);
    expect(cache.get(applicationId, "optimized-cv", "fr")).toEqual(cvPreview);
    expect(cvEn.preview).toEqual(cvPreviewEn);
    expect(clEn.preview).toEqual(coverLetterPreviewEn);
  });

  it("reuses a previously generated language when switching back", async () => {
    const cache = createExportPreviewCache();
    const fetchPreview = vi
      .fn()
      .mockResolvedValueOnce(cvPreview)
      .mockResolvedValueOnce(cvPreviewEn);

    const fr = await loadPreview(
      cache,
      null,
      applicationId,
      "optimized-cv",
      "fr",
      fetchPreview,
    );
    const en = await loadPreview(
      cache,
      fr.scope,
      applicationId,
      "optimized-cv",
      "en",
      fetchPreview,
    );
    const backToFr = await loadPreview(
      cache,
      en.scope,
      applicationId,
      "optimized-cv",
      "fr",
      fetchPreview,
    );

    expect(fetchPreview).toHaveBeenCalledTimes(2);
    expect(backToFr.preview).toBe(cvPreview);
  });

  it("reuses both cached previews after leaving and returning to Export", async () => {
    const cache = createExportPreviewCache();
    const fetchPreview = vi
      .fn()
      .mockResolvedValueOnce(cvPreview)
      .mockResolvedValueOnce(coverLetterPreview);

    const firstVisitCv = await loadPreview(
      cache,
      null,
      applicationId,
      "optimized-cv",
      "fr",
      fetchPreview,
    );
    await loadPreview(
      cache,
      firstVisitCv.scope,
      applicationId,
      "cover-letter",
      "fr",
      fetchPreview,
    );

    const returnedCv = await loadPreview(
      cache,
      null,
      applicationId,
      "optimized-cv",
      "fr",
      fetchPreview,
    );
    const returnedCoverLetter = await loadPreview(
      cache,
      returnedCv.scope,
      applicationId,
      "cover-letter",
      "fr",
      fetchPreview,
    );

    expect(fetchPreview).toHaveBeenCalledTimes(2);
    expect(returnedCv.preview).toBe(cvPreview);
    expect(returnedCoverLetter.preview).toBe(coverLetterPreview);
  });

  it("does not cache failed preview requests", async () => {
    const cache = createExportPreviewCache();
    const fetchPreview = vi
      .fn()
      .mockRejectedValueOnce(new Error("preview failed"))
      .mockResolvedValueOnce(cvPreview);

    const scope = { applicationId, presentationLanguage: "fr" as const };
    await expect(
      loadPreview(
        cache,
        null,
        applicationId,
        "optimized-cv",
        "fr",
        fetchPreview,
      ),
    ).rejects.toThrow("preview failed");
    expect(cache.get(applicationId, "optimized-cv", "fr")).toBeNull();

    const retry = await loadPreview(
      cache,
      scope,
      applicationId,
      "optimized-cv",
      "fr",
      fetchPreview,
    );
    expect(fetchPreview).toHaveBeenCalledTimes(2);
    expect(retry.preview).toEqual(cvPreview);
  });

  it("keeps workspace-scoped cache instances isolated from each other", () => {
    const first = createExportPreviewCache();
    const second = createExportPreviewCache();
    first.set(applicationId, "optimized-cv", "fr", cvPreview);

    expect(first.get(applicationId, "optimized-cv", "fr")).toEqual(cvPreview);
    expect(second.get(applicationId, "optimized-cv", "fr")).toBeNull();
  });

  it("invalidates only the replaced saved document's cached previews", () => {
    const cache = createExportPreviewCache();
    cache.set(applicationId, "optimized-cv", "fr", cvPreview);
    cache.set(applicationId, "optimized-cv", "en", cvPreviewEn);
    cache.set(applicationId, "cover-letter", "fr", coverLetterPreview);

    cache.invalidateDocument(applicationId, "optimized-cv");

    expect(cache.get(applicationId, "optimized-cv", "fr")).toBeNull();
    expect(cache.get(applicationId, "optimized-cv", "en")).toBeNull();
    expect(cache.get(applicationId, "cover-letter", "fr")).toEqual(
      coverLetterPreview,
    );
  });

  it("does not share cache entries across application ids", () => {
    const cache = createExportPreviewCache();
    cache.set(applicationId, "optimized-cv", "fr", cvPreview);

    expect(cache.get("other-application", "optimized-cv", "fr")).toBeNull();
    expect(
      shouldInvalidateExportPreviewCache(
        { applicationId, presentationLanguage: "fr" },
        { applicationId: "other-application", presentationLanguage: "fr" },
      ),
    ).toBe(true);
    expect(
      readCachedExportPreview(
        cache,
        { applicationId, presentationLanguage: "fr" },
        { applicationId: "other-application", presentationLanguage: "fr" },
        "optimized-cv",
      ),
    ).toBeNull();
    expect(cache.get(applicationId, "optimized-cv", "fr")).toBeNull();
  });

  it("keeps PDF export independent from cached preview bodies", () => {
    const cache = createExportPreviewCache();
    cache.set(applicationId, "optimized-cv", "fr", cvPreview);
    cache.set(applicationId, "cover-letter", "fr", coverLetterPreview);

    expect(
      exportRequestsForSelection(
        { optimizedCv: true, coverLetter: true },
        "fr",
      ),
    ).toEqual([
      { document: "optimized-cv", presentationLanguage: "fr" },
      { document: "cover-letter", presentationLanguage: "fr" },
    ]);
    expect(cache.get(applicationId, "optimized-cv", "fr")).toEqual(cvPreview);
  });
});
