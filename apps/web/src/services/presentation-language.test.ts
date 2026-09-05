import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PRESENTATION_LANGUAGE_STORAGE_KEY,
  readStoredPresentationLanguage,
  resolvePresentationLanguage,
  writeStoredPresentationLanguage,
} from "./presentation-language";
import { LOCALE_STORAGE_KEY } from "../i18n/storage";

function createMemoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
  };
}

describe("presentation language preference", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when nothing is stored instead of substituting UI locale", () => {
    vi.stubGlobal("localStorage", createMemoryStorage());

    expect(readStoredPresentationLanguage()).toBeNull();
  });

  it("persists a validated Presentation Language independently from UI locale", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("localStorage", storage);
    storage.setItem(LOCALE_STORAGE_KEY, "es");

    writeStoredPresentationLanguage("fr");

    expect(readStoredPresentationLanguage()).toBe("fr");
    expect(storage.getItem(PRESENTATION_LANGUAGE_STORAGE_KEY)).toBe("fr");
    expect(storage.getItem(LOCALE_STORAGE_KEY)).toBe("es");
  });

  it("ignores an invalid stored value", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("localStorage", storage);
    storage.setItem(PRESENTATION_LANGUAGE_STORAGE_KEY, "de");

    expect(readStoredPresentationLanguage()).toBeNull();
  });

  it("defaults to the current UI locale only when no valid preference exists", () => {
    expect(resolvePresentationLanguage("fr", "es")).toBe("fr");
    expect(resolvePresentationLanguage(null, "en")).toBe("en");
    expect(resolvePresentationLanguage("de", "es")).toBe("es");
    expect(resolvePresentationLanguage(undefined, "fr")).toBe("fr");
  });
});
