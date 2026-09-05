import type { Locale } from "../i18n/locales";

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
} as const satisfies Record<Locale, readonly string[]>;

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

function formatCalendarDate(
  year: number,
  month: number,
  day: number,
  locale: Locale,
): string {
  const monthName = MONTH_NAMES[locale][month - 1];
  if (locale === "es") {
    return `${day} de ${monthName} de ${year}`;
  }
  if (locale === "fr") {
    return `${day} ${monthName} ${year}`;
  }
  return `${monthName} ${day}, ${year}`;
}

export function formatCoverLetterWorkspaceDate(
  date: string,
  workingLanguage: Locale | null,
): string {
  if (workingLanguage === null) {
    return date;
  }

  const iso = date.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!iso) {
    return date;
  }

  const year = Number(iso[1]);
  const month = Number(iso[2]);
  const day = Number(iso[3]);
  if (!isRealUtcCalendarDate(year, month, day)) {
    return date;
  }

  return formatCalendarDate(year, month, day, workingLanguage);
}
