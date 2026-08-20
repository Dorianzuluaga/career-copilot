import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";

export const LOCALE_STORAGE_KEY = "career-copilot.locale";

function getLocalStorage(): Storage | null {
  try {
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

export function readStoredLocale(): Locale {
  const value = getLocalStorage()?.getItem(LOCALE_STORAGE_KEY);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function writeStoredLocale(locale: Locale): void {
  getLocalStorage()?.setItem(LOCALE_STORAGE_KEY, locale);
}
