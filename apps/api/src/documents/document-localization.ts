import type {
  CoverLetterDocumentChrome,
  OptimizedCvDocumentChrome,
} from "../types/export.js";
import type { LanguageItem } from "../types/master-cv.js";
import type { SupportedLocale } from "../types/supported-locale.js";

const OPTIMIZED_CV_DOCUMENT_CHROME = {
  es: {
    professionalSummary: "Resumen profesional",
    experience: "Experiencia",
    education: "Formación",
    skills: "Competencias",
    languages: "Idiomas",
    certifications: "Certificaciones",
    personalProjects: "Proyectos personales",
    present: "Actualidad",
    openProject: "Abrir proyecto",
  },
  en: {
    professionalSummary: "Professional summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    certifications: "Certifications",
    personalProjects: "Personal projects",
    present: "Present",
    openProject: "Open project",
  },
  fr: {
    professionalSummary: "Résumé professionnel",
    experience: "Expérience",
    education: "Formation",
    skills: "Compétences",
    languages: "Langues",
    certifications: "Certifications",
    personalProjects: "Projets personnels",
    present: "Aujourd'hui",
    openProject: "Ouvrir le projet",
  },
} as const satisfies Record<SupportedLocale, OptimizedCvDocumentChrome>;

const MONTH_NAMES = {
  es: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  fr: [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ],
} as const satisfies Record<SupportedLocale, readonly string[]>;

const ENGLISH_MONTHS: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sept: 9,
  sep: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

export class CoverLetterDateError extends Error {
  readonly statusCode = 400;

  constructor() {
    super("The saved Cover Letter is invalid.");
  }
}

export function resolveOptimizedCvDocumentChrome(
  locale: SupportedLocale,
): OptimizedCvDocumentChrome {
  return { ...OPTIMIZED_CV_DOCUMENT_CHROME[locale] };
}

function isRealUtcCalendarDate(
  year: number,
  month: number,
  day: number,
): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function parseCoverLetterCalendarDate(value: string): {
  year: number;
  month: number;
  day: number;
} {
  const trimmed = value.trim();
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    if (!isRealUtcCalendarDate(year, month, day)) {
      throw new CoverLetterDateError();
    }
    return { year, month, day };
  }

  const englishLong = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (englishLong) {
    const month = ENGLISH_MONTHS[englishLong[1].toLowerCase()];
    const day = Number(englishLong[2]);
    const year = Number(englishLong[3]);
    if (month === undefined || !isRealUtcCalendarDate(year, month, day)) {
      throw new CoverLetterDateError();
    }
    return { year, month, day };
  }

  throw new CoverLetterDateError();
}

export function formatCoverLetterPresentationDate(
  value: string,
  locale: SupportedLocale,
): string {
  const { year, month, day } = parseCoverLetterCalendarDate(value);
  const monthName = MONTH_NAMES[locale][month - 1];
  if (locale === "es") {
    return `${day} de ${monthName} de ${year}`;
  }
  if (locale === "fr") {
    return `${day} ${monthName} ${year}`;
  }
  return `${monthName} ${day}, ${year}`;
}

export function resolveCoverLetterDocumentChrome(
  date: string,
  locale: SupportedLocale,
): CoverLetterDocumentChrome {
  return {
    formattedDate: formatCoverLetterPresentationDate(date, locale),
  };
}

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
