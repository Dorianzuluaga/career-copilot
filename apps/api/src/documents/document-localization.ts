import type { LanguageItem } from "../types/master-cv.js";
import type { SupportedLocale } from "../types/supported-locale.js";

const LANGUAGE_NAME_IDS = ["spanish", "english", "french"] as const;
type LanguageNameId = (typeof LANGUAGE_NAME_IDS)[number];

const LANGUAGE_NAME_LABELS = {
  spanish: { es: "Español", en: "Spanish", fr: "Espagnol" },
  english: { es: "Inglés", en: "English", fr: "Anglais" },
  french: { es: "Francés", en: "French", fr: "Français" },
} as const satisfies Record<LanguageNameId, Record<SupportedLocale, string>>;

const PROFICIENCY_IDS = [
  "native",
  "intermediate",
  "advanced",
  "basic",
] as const;
type ProficiencyId = (typeof PROFICIENCY_IDS)[number];

const PROFICIENCY_LABELS = {
  native: { es: "Nativo", en: "Native", fr: "Natif" },
  intermediate: { es: "Intermedio", en: "Intermediate", fr: "Intermédiaire" },
  advanced: { es: "Avanzado", en: "Advanced", fr: "Avancé" },
  basic: { es: "Básico", en: "Basic", fr: "Basique" },
} as const satisfies Record<ProficiencyId, Record<SupportedLocale, string>>;

function catalogAliases<Id extends string>(
  ids: readonly Id[],
  labels: Record<Id, Record<SupportedLocale, string>>,
): Record<string, Id> {
  const aliases: Record<string, Id> = {};
  for (const id of ids) {
    for (const locale of ["es", "en", "fr"] as const) {
      aliases[labels[id][locale].trim().toLowerCase()] = id;
    }
  }
  return aliases;
}

const LANGUAGE_NAME_ALIASES = catalogAliases(
  LANGUAGE_NAME_IDS,
  LANGUAGE_NAME_LABELS,
);
const PROFICIENCY_ALIASES = catalogAliases(PROFICIENCY_IDS, PROFICIENCY_LABELS);

function localizeKnownValue<Id extends string>(
  value: string | null,
  aliases: Record<string, Id>,
  labels: Record<Id, Record<SupportedLocale, string>>,
  locale: SupportedLocale,
): string | null {
  if (value === null) {
    return null;
  }
  const id = aliases[value.trim().toLowerCase()];
  if (id === undefined) {
    return value;
  }
  return labels[id][locale];
}

export function localizeLanguageEntries(
  languages: LanguageItem[],
  locale: SupportedLocale,
): LanguageItem[] {
  return languages.map((item) => ({
    name: localizeKnownValue(
      item.name,
      LANGUAGE_NAME_ALIASES,
      LANGUAGE_NAME_LABELS,
      locale,
    ),
    proficiency: localizeKnownValue(
      item.proficiency,
      PROFICIENCY_ALIASES,
      PROFICIENCY_LABELS,
      locale,
    ),
  }));
}
