import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LOCALE, isLocale } from "./locales";
import {
  LOCALE_STORAGE_KEY,
  readStoredLocale,
  writeStoredLocale,
} from "./storage";

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

describe("locale storage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to Spanish when nothing is stored", () => {
    vi.stubGlobal("localStorage", createMemoryStorage());

    expect(readStoredLocale()).toBe(DEFAULT_LOCALE);
    expect(readStoredLocale()).toBe("es");
  });

  it("persists a supported locale and reads it back", () => {
    vi.stubGlobal("localStorage", createMemoryStorage());

    writeStoredLocale("fr");

    expect(readStoredLocale()).toBe("fr");
  });

  it("falls back to Spanish when the stored value is invalid", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("localStorage", storage);
    storage.setItem(LOCALE_STORAGE_KEY, "de");

    expect(readStoredLocale()).toBe("es");
  });

  it("defaults to Spanish when localStorage is unavailable", () => {
    vi.stubGlobal("localStorage", undefined);

    expect(readStoredLocale()).toBe("es");
    expect(() => writeStoredLocale("en")).not.toThrow();
  });
});

describe("isLocale", () => {
  it("accepts only Spanish, English, and French", () => {
    expect(isLocale("es")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});
