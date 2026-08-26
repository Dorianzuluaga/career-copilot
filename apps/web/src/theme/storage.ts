import { DEFAULT_THEME, isTheme, type Theme } from "./themes";

export const THEME_STORAGE_KEY = "career-copilot.theme";

function getLocalStorage(): Storage | null {
  try {
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

export function readStoredTheme(): Theme {
  const value = getLocalStorage()?.getItem(THEME_STORAGE_KEY);
  return isTheme(value) ? value : DEFAULT_THEME;
}

export function writeStoredTheme(theme: Theme): void {
  getLocalStorage()?.setItem(THEME_STORAGE_KEY, theme);
}
