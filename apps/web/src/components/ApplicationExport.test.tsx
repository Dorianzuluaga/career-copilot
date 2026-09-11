import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "../context/LocaleProvider";
import type { Locale } from "../i18n/locales";
import { writeStoredLocale } from "../i18n/storage";
import { translate } from "../i18n/translate";
import { ApiError } from "../services/api";
import { writeStoredPresentationLanguage } from "../services/presentation-language";
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
  effectiveExportSelection,
  ExportPreviewPanel,
  exportDownloadFailureKind,
  exportDownloadFailureMessageKeys,
  exportRequestsForSelection,
  formatExportDownloadFailure,
  readCachedExportPreview,
  shouldInvalidateExportPreviewCache,
  type ExportPreviewCache,
} from "./ApplicationExport";
import { ApplicationOptimizedCv } from "./ApplicationOptimizedCv";

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

  it("downloads only Optimized CV when no saved Cover Letter exists", () => {
    expect(
      exportRequestsForSelection(
        effectiveExportSelection(
          { optimizedCv: true, coverLetter: true },
          false,
        ),
        "es",
      ),
    ).toEqual([{ document: "optimized-cv", presentationLanguage: "es" }]);
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

describe("export package download failure UX", () => {
  const englishApiAdaptationMessage =
    "We couldn't prepare this document in the selected presentation language.";

  it("stops the package and identifies Optimized CV when the first document fails", () => {
    const requests = exportRequestsForSelection(
      { optimizedCv: true, coverLetter: true },
      "fr",
    );
    const error = new ApiError(englishApiAdaptationMessage, 502);

    expect(requests[0]).toEqual({
      document: "optimized-cv",
      presentationLanguage: "fr",
    });
    expect(exportDownloadFailureKind(error)).toBe("adaptation");
    expect(
      exportDownloadFailureMessageKeys(
        "optimized-cv",
        requests.length,
        "adaptation",
      ),
    ).toEqual([
      "export.packageIncomplete",
      "export.adaptationFailedOptimizedCv",
    ]);
    expect(
      formatExportDownloadFailure(
        (key) => translate("en", key),
        "optimized-cv",
        requests.length,
        error,
      ),
    ).toBe(
      "The package is incomplete. The Optimized CV could not be prepared in the selected presentation language.",
    );
    expect(
      formatExportDownloadFailure(
        (key) => translate("en", key),
        "optimized-cv",
        requests.length,
        error,
      ),
    ).not.toContain("Cover Letter");
    expect(
      formatExportDownloadFailure(
        (key) => translate("en", key),
        "optimized-cv",
        requests.length,
        error,
      ),
    ).not.toContain(englishApiAdaptationMessage);
  });

  it("keeps the downloaded CV and identifies Cover Letter when the second document fails", () => {
    const requests = exportRequestsForSelection(
      { optimizedCv: true, coverLetter: true },
      "es",
    );
    const error = new ApiError(englishApiAdaptationMessage, 502);

    expect(requests.map((request) => request.document)).toEqual([
      "optimized-cv",
      "cover-letter",
    ]);
    expect(
      formatExportDownloadFailure(
        (key) => translate("en", key),
        "cover-letter",
        requests.length,
        error,
      ),
    ).toBe(
      "The package is incomplete. The Cover Letter could not be prepared in the selected presentation language.",
    );
    expect(
      formatExportDownloadFailure(
        (key) => translate("en", key),
        "cover-letter",
        requests.length,
        error,
      ),
    ).not.toContain("Optimized CV");
  });

  it("identifies a single selected document without describing the other document", () => {
    const requests = exportRequestsForSelection(
      { optimizedCv: true, coverLetter: false },
      "en",
    );
    const error = new ApiError("Request failed.", 500);

    expect(requests).toEqual([
      { document: "optimized-cv", presentationLanguage: "en" },
    ]);
    expect(exportDownloadFailureKind(error)).toBe("generic");
    expect(
      exportDownloadFailureMessageKeys(
        "optimized-cv",
        requests.length,
        "generic",
      ),
    ).toEqual(["export.downloadFailedOptimizedCv"]);
    expect(
      formatExportDownloadFailure(
        (key) => translate("en", key),
        "optimized-cv",
        requests.length,
        error,
      ),
    ).toBe("The Optimized CV could not be downloaded.");
    expect(
      formatExportDownloadFailure(
        (key) => translate("en", key),
        "optimized-cv",
        requests.length,
        error,
      ),
    ).not.toContain("The package is incomplete.");
    expect(
      formatExportDownloadFailure(
        (key) => translate("en", key),
        "optimized-cv",
        requests.length,
        error,
      ),
    ).not.toContain("Cover Letter");
  });

  it.each(["es", "en", "fr"] as const)(
    "localizes a 502 adaptation failure for %s without exposing the API English message",
    (locale) => {
      const error = new ApiError(englishApiAdaptationMessage, 502);
      const message = formatExportDownloadFailure(
        (key) => translate(locale, key),
        "cover-letter",
        2,
        error,
      );

      expect(message).toBe(
        `${translate(locale, "export.packageIncomplete")} ${translate(locale, "export.adaptationFailedCoverLetter")}`,
      );
      expect(message).not.toContain(englishApiAdaptationMessage);
      expect(message).not.toContain("We couldn't prepare");
    },
  );

  it("retries the same Presentation Language and saved-document selection", () => {
    const selection = { optimizedCv: true, coverLetter: true } as const;
    const first = exportRequestsForSelection(selection, "fr");
    const retry = exportRequestsForSelection(selection, "fr");

    expect(retry).toEqual(first);
    expect(retry).toEqual([
      { document: "optimized-cv", presentationLanguage: "fr" },
      { document: "cover-letter", presentationLanguage: "fr" },
    ]);
  });
});

describe("export UI/Working/Presentation Language matrix", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const spanishOptimizedCvChrome: OptimizedCvDocumentChrome = {
    professionalSummary: "Resumen profesional",
    experience: "Experiencia",
    education: "Formación",
    skills: "Competencias",
    languages: "Idiomas",
    certifications: "Certificaciones",
    personalProjects: "Proyectos personales",
    present: "Actualidad",
    openProject: "Abrir proyecto",
  };

  it.each([
    {
      ui: "es" as const,
      working: "es" as const,
      presentation: "es" as const,
      chrome: spanishOptimizedCvChrome,
      expectedChrome: "Resumen profesional",
      unexpectedChrome: "Professional summary",
    },
    {
      ui: "es" as const,
      working: "es" as const,
      presentation: "en" as const,
      chrome: englishOptimizedCvChrome,
      expectedChrome: "Professional summary",
      unexpectedChrome: "Resumen profesional",
    },
    {
      ui: "es" as const,
      working: "es" as const,
      presentation: "fr" as const,
      chrome: frenchOptimizedCvChrome,
      expectedChrome: "Résumé professionnel",
      unexpectedChrome: "Resumen profesional",
    },
    {
      ui: "en" as const,
      working: "en" as const,
      presentation: "es" as const,
      chrome: spanishOptimizedCvChrome,
      expectedChrome: "Resumen profesional",
      unexpectedChrome: "Professional summary",
    },
    {
      ui: "fr" as const,
      working: "fr" as const,
      presentation: "en" as const,
      chrome: englishOptimizedCvChrome,
      expectedChrome: "Professional summary",
      unexpectedChrome: "Résumé professionnel",
    },
  ])(
    "keeps UI $ui chrome out of Preview when Working is $working and Presentation is $presentation",
    ({
      ui,
      working,
      presentation,
      chrome,
      expectedChrome,
      unexpectedChrome,
    }) => {
      const storage = createMemoryStorage();
      vi.stubGlobal("localStorage", storage);
      writeStoredLocale(ui);

      const markup = renderToStaticMarkup(
        <LocaleProvider>
          <ExportPreviewPanel
            applicationId="application-id"
            preview={{
              document: "optimized-cv",
              presentationLanguage: presentation,
              data: {
                ...optimizedCv,
                workingLanguage: working,
                personalProjects: [
                  {
                    name: "Career Copilot",
                    description: "Saved project description.",
                    technologies: "TypeScript",
                    url: "https://example.com/career-copilot",
                  },
                ],
              },
              chrome,
            }}
          />
        </LocaleProvider>,
      );

      expect(markup).toContain(`data-presentation-language="${presentation}"`);
      expect(markup).toContain(expectedChrome);
      expect(markup).toContain("TypeScript engineer building APIs.");
      expect(markup).toContain("https://example.com/career-copilot");
      expect(markup).toContain(chrome.openProject);
      expect(markup).not.toContain(unexpectedChrome);
      expect(markup).not.toContain(">Edit<");
      expect(markup).not.toContain(">Editar<");
    },
  );

  it("uses the saved documents passed into Export, not unsaved editor state", () => {
    const savedOnlyMarkup = renderExport(
      <ApplicationExport
        applicationId="application-id"
        coverLetter={null}
        optimizedCv={optimizedCv}
        previewCache={createExportPreviewCache()}
      />,
    );

    expect(savedOnlyMarkup).toContain("Idioma de presentación");
    expect(savedOnlyMarkup).toContain(
      "Este idioma se aplica al CV optimizado.",
    );
    expect(savedOnlyMarkup).toContain(">CV optimizado</label>");
    expect(savedOnlyMarkup).toContain(">Descargar</button>");
    expect(savedOnlyMarkup).not.toContain(">Carta de presentación</label>");
    expect(savedOnlyMarkup).not.toContain('role="tablist"');
    expect(savedOnlyMarkup).not.toContain("Dear Hiring Manager,");
    expect(savedOnlyMarkup).not.toContain("<textarea");
    expect(savedOnlyMarkup).not.toContain(
      "Se necesita un CV optimizado guardado antes de previsualizar los documentos.",
    );
  });

  it("shows Cover Letter selection after a Cover Letter is saved in the same workspace", () => {
    const withCoverLetterMarkup = renderExport(
      <ApplicationExport
        applicationId="application-id"
        coverLetter={coverLetter}
        optimizedCv={optimizedCv}
        previewCache={createExportPreviewCache()}
      />,
    );

    expect(withCoverLetterMarkup).toContain(">Carta de presentación</label>");
    expect(withCoverLetterMarkup).toContain('role="tablist"');
    expect(withCoverLetterMarkup).toContain(
      "Este idioma se aplica tanto al CV optimizado como a la carta de presentación.",
    );
    expect(withCoverLetterMarkup).not.toContain(
      "Este idioma se aplica al CV optimizado.</p>",
    );
  });
});
