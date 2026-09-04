export const SUPPORTED_LOCALES = ["es", "en", "fr"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

export class SupportedLocaleValidationError extends Error {
  readonly statusCode = 400;

  constructor() {
    super('locale must be one of "es", "en", or "fr".');
  }
}

export function validateSupportedLocale(value: unknown): SupportedLocale {
  if (!isSupportedLocale(value)) {
    throw new SupportedLocaleValidationError();
  }
  return value;
}

const LANGUAGE_NAMES: Record<SupportedLocale, string> = {
  es: "Spanish",
  en: "English",
  fr: "French",
};

export function generationLanguageInstruction(locale: SupportedLocale): string {
  return [
    `Write all generated narrative text in ${LANGUAGE_NAMES[locale]} (${locale}).`,
    "Keep verifiable names, skills, technologies, URLs, contact details, and other protected facts unchanged.",
  ].join(" ");
}
