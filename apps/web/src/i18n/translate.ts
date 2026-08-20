import { catalogs, type TranslationKey } from "./messages";
import { DEFAULT_LOCALE, type Locale } from "./locales";

export type TranslationValues = Record<string, string | number>;

function lookup(locale: Locale, key: TranslationKey): string | undefined {
  const segments = key.split(".");
  let current: unknown = catalogs[locale];

  for (const segment of segments) {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === "string" ? current : undefined;
}

export function interpolate(
  template: string,
  values?: TranslationValues,
): string {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = values[name];
    return value === undefined ? match : String(value);
  });
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  values?: TranslationValues,
): string {
  const message = lookup(locale, key) ?? lookup(DEFAULT_LOCALE, key) ?? key;
  return interpolate(message, values);
}
