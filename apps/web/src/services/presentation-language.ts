import { isLocale, type Locale } from "../i18n/locales";

export const PRESENTATION_LANGUAGE_STORAGE_KEY =
  "career-copilot.presentationLanguage";

function getLocalStorage(): Storage | null {
  try {
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

export function readStoredPresentationLanguage(): Locale | null {
  const value = getLocalStorage()?.getItem(PRESENTATION_LANGUAGE_STORAGE_KEY);
  return isLocale(value) ? value : null;
}

export function writeStoredPresentationLanguage(language: Locale): void {
  getLocalStorage()?.setItem(PRESENTATION_LANGUAGE_STORAGE_KEY, language);
}

export function resolvePresentationLanguage(
  stored: unknown,
  uiLocale: Locale,
): Locale {
  return isLocale(stored) ? stored : uiLocale;
}
