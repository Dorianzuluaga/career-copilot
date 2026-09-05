import { describe, expect, it } from "vitest";
import type { LanguageItem } from "../types/master-cv.js";
import type { SupportedLocale } from "../types/supported-locale.js";
import {
  CoverLetterDateError,
  formatCoverLetterPresentationDate,
  localizeLanguageEntries,
  parseCoverLetterCalendarDate,
  resolveCoverLetterDocumentChrome,
  resolveOptimizedCvDocumentChrome,
} from "./document-localization.js";

const LOCALES: SupportedLocale[] = ["es", "en", "fr"];

const CHROME_KEYS = [
  "professionalSummary",
  "experience",
  "education",
  "skills",
  "languages",
  "certifications",
  "personalProjects",
  "present",
  "openProject",
] as const;

describe("resolveOptimizedCvDocumentChrome", () => {
  it.each(LOCALES)(
    "resolves every Optimized CV chrome key for %s without fallback",
    (locale) => {
      const chrome = resolveOptimizedCvDocumentChrome(locale);

      expect(Object.keys(chrome).sort()).toEqual([...CHROME_KEYS].sort());
      for (const key of CHROME_KEYS) {
        expect(chrome[key].trim().length).toBeGreaterThan(0);
      }
    },
  );

  it("returns distinct catalogs for es, en, and fr", () => {
    const es = resolveOptimizedCvDocumentChrome("es");
    const en = resolveOptimizedCvDocumentChrome("en");
    const fr = resolveOptimizedCvDocumentChrome("fr");

    expect(es).toEqual({
      professionalSummary: "Resumen profesional",
      experience: "Experiencia",
      education: "Formación",
      skills: "Competencias",
      languages: "Idiomas",
      certifications: "Certificaciones",
      personalProjects: "Proyectos personales",
      present: "Actualidad",
      openProject: "Abrir proyecto",
    });
    expect(en).toEqual({
      professionalSummary: "Professional summary",
      experience: "Experience",
      education: "Education",
      skills: "Skills",
      languages: "Languages",
      certifications: "Certifications",
      personalProjects: "Personal projects",
      present: "Present",
      openProject: "Open project",
    });
    expect(fr).toEqual({
      professionalSummary: "Résumé professionnel",
      experience: "Expérience",
      education: "Formation",
      skills: "Compétences",
      languages: "Langues",
      certifications: "Certifications",
      personalProjects: "Projets personnels",
      present: "Aujourd'hui",
      openProject: "Ouvrir le projet",
    });
    expect(es).not.toEqual(en);
    expect(en).not.toEqual(fr);
    expect(es).not.toEqual(fr);
  });

  it("returns a copy so callers cannot mutate the catalog", () => {
    const chrome = resolveOptimizedCvDocumentChrome("en");
    chrome.present = "Now";
    expect(resolveOptimizedCvDocumentChrome("en").present).toBe("Present");
  });
});

describe("Cover Letter date localization", () => {
  it("formats the approved ISO calendar date for es, en, and fr", () => {
    expect(formatCoverLetterPresentationDate("2026-08-07", "es")).toBe(
      "7 de agosto de 2026",
    );
    expect(formatCoverLetterPresentationDate("2026-08-07", "en")).toBe(
      "August 7, 2026",
    );
    expect(formatCoverLetterPresentationDate("2026-08-07", "fr")).toBe(
      "7 août 2026",
    );
  });

  it("formats a legacy English long date without using the host locale", () => {
    expect(formatCoverLetterPresentationDate("August 7, 2026", "es")).toBe(
      "7 de agosto de 2026",
    );
    expect(formatCoverLetterPresentationDate("August 7, 2026", "en")).toBe(
      "August 7, 2026",
    );
    expect(formatCoverLetterPresentationDate("August 7, 2026", "fr")).toBe(
      "7 août 2026",
    );
  });

  it("parses ISO dates as UTC calendar values so the server time zone cannot shift the day", () => {
    expect(parseCoverLetterCalendarDate("2026-08-07")).toEqual({
      year: 2026,
      month: 8,
      day: 7,
    });
    expect(parseCoverLetterCalendarDate("2026-01-01")).toEqual({
      year: 2026,
      month: 1,
      day: 1,
    });
    expect(parseCoverLetterCalendarDate("2026-12-31")).toEqual({
      year: 2026,
      month: 12,
      day: 31,
    });
    expect(formatCoverLetterPresentationDate("2026-01-01", "en")).toBe(
      "January 1, 2026",
    );
    expect(formatCoverLetterPresentationDate("2026-12-31", "es")).toBe(
      "31 de diciembre de 2026",
    );
    expect(formatCoverLetterPresentationDate("2026-12-31", "fr")).toBe(
      "31 décembre 2026",
    );
  });

  it("rejects ambiguous or malformed dates instead of guessing", () => {
    for (const value of [
      "2026",
      "2026-08",
      "August 2026",
      "7 August 2026",
      "7 de agosto de 2026",
      "Present",
      "2026-02-30",
      "February 30, 2026",
      "not a date",
    ]) {
      expect(() => formatCoverLetterPresentationDate(value, "en")).toThrow(
        CoverLetterDateError,
      );
    }
  });

  it("resolves Cover Letter chrome from the saved date and Presentation Language", () => {
    expect(resolveCoverLetterDocumentChrome("2026-08-07", "es")).toEqual({
      formattedDate: "7 de agosto de 2026",
    });
  });
});

describe("localizeLanguageEntries", () => {
  const languageCases: Array<{
    source: string;
    es: string;
    en: string;
    fr: string;
  }> = [
    { source: "Español", es: "Español", en: "Spanish", fr: "Espagnol" },
    { source: "Spanish", es: "Español", en: "Spanish", fr: "Espagnol" },
    { source: "Espagnol", es: "Español", en: "Spanish", fr: "Espagnol" },
    { source: "Inglés", es: "Inglés", en: "English", fr: "Anglais" },
    { source: "English", es: "Inglés", en: "English", fr: "Anglais" },
    { source: "Anglais", es: "Inglés", en: "English", fr: "Anglais" },
    { source: "Francés", es: "Francés", en: "French", fr: "Français" },
    { source: "French", es: "Francés", en: "French", fr: "Français" },
    { source: "Français", es: "Francés", en: "French", fr: "Français" },
  ];

  const proficiencyCases: Array<{
    source: string;
    es: string;
    en: string;
    fr: string;
  }> = [
    { source: "Nativo", es: "Nativo", en: "Native", fr: "Natif" },
    { source: "Native", es: "Nativo", en: "Native", fr: "Natif" },
    { source: "Natif", es: "Nativo", en: "Native", fr: "Natif" },
    {
      source: "Intermedio",
      es: "Intermedio",
      en: "Intermediate",
      fr: "Intermédiaire",
    },
    {
      source: "Intermediate",
      es: "Intermedio",
      en: "Intermediate",
      fr: "Intermédiaire",
    },
    {
      source: "Intermédiaire",
      es: "Intermedio",
      en: "Intermediate",
      fr: "Intermédiaire",
    },
    { source: "Avanzado", es: "Avanzado", en: "Advanced", fr: "Avancé" },
    { source: "Advanced", es: "Avanzado", en: "Advanced", fr: "Avancé" },
    { source: "Avancé", es: "Avanzado", en: "Advanced", fr: "Avancé" },
    { source: "Básico", es: "Básico", en: "Basic", fr: "Basique" },
    { source: "Basic", es: "Básico", en: "Basic", fr: "Basique" },
    { source: "Basique", es: "Básico", en: "Basic", fr: "Basique" },
  ];

  it.each(languageCases)(
    "maps $source to ES/EN/FR language labels",
    ({ source, es, en, fr }) => {
      expect(
        localizeLanguageEntries([{ name: source, proficiency: null }], "es")[0]
          .name,
      ).toBe(es);
      expect(
        localizeLanguageEntries([{ name: source, proficiency: null }], "en")[0]
          .name,
      ).toBe(en);
      expect(
        localizeLanguageEntries([{ name: source, proficiency: null }], "fr")[0]
          .name,
      ).toBe(fr);
    },
  );

  it.each(proficiencyCases)(
    "maps $source to ES/EN/FR proficiency labels",
    ({ source, es, en, fr }) => {
      expect(
        localizeLanguageEntries([{ name: null, proficiency: source }], "es")[0]
          .proficiency,
      ).toBe(es);
      expect(
        localizeLanguageEntries([{ name: null, proficiency: source }], "en")[0]
          .proficiency,
      ).toBe(en);
      expect(
        localizeLanguageEntries([{ name: null, proficiency: source }], "fr")[0]
          .proficiency,
      ).toBe(fr);
    },
  );

  it("maps aliases from different source languages onto the requested Presentation Language", () => {
    const entries: LanguageItem[] = [
      { name: "English", proficiency: "Intermedio" },
      { name: "Español", proficiency: "Nativo" },
    ];

    expect(localizeLanguageEntries(entries, "fr")).toEqual([
      { name: "Anglais", proficiency: "Intermédiaire" },
      { name: "Espagnol", proficiency: "Natif" },
    ]);
    expect(localizeLanguageEntries(entries, "en")).toEqual([
      { name: "English", proficiency: "Intermediate" },
      { name: "Spanish", proficiency: "Native" },
    ]);
    expect(localizeLanguageEntries(entries, "es")).toEqual([
      { name: "Inglés", proficiency: "Intermedio" },
      { name: "Español", proficiency: "Nativo" },
    ]);
  });

  it("matches known values after trimming and case normalization", () => {
    expect(
      localizeLanguageEntries(
        [{ name: "  ENGLISH  ", proficiency: " nativo " }],
        "fr",
      ),
    ).toEqual([{ name: "Anglais", proficiency: "Natif" }]);
  });

  it("passes unknown language and proficiency values through unchanged", () => {
    const entries: LanguageItem[] = [
      { name: "Klingon", proficiency: "Fluent" },
    ];

    expect(localizeLanguageEntries(entries, "fr")).toEqual(entries);
    expect(localizeLanguageEntries(entries, "fr")[0]).not.toBe(entries[0]);
  });

  it("preserves language entry order, count, and null fields", () => {
    const entries: LanguageItem[] = [
      { name: "Español", proficiency: "Nativo" },
      { name: null, proficiency: null },
      { name: "English", proficiency: "Intermedio" },
    ];

    const localized = localizeLanguageEntries(entries, "fr");

    expect(localized).toHaveLength(3);
    expect(localized.map((item) => item.name)).toEqual([
      "Espagnol",
      null,
      "Anglais",
    ]);
    expect(localized[1]).toEqual({ name: null, proficiency: null });
  });

  it("does not mutate the original language entries", () => {
    const entries: LanguageItem[] = [
      { name: "Español", proficiency: "Nativo" },
    ];

    localizeLanguageEntries(entries, "en");

    expect(entries).toEqual([{ name: "Español", proficiency: "Nativo" }]);
  });
});
