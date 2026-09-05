import { describe, expect, it } from "vitest";
import type { LanguageItem } from "../types/master-cv.js";
import { localizeLanguageEntries } from "./document-localization.js";

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
