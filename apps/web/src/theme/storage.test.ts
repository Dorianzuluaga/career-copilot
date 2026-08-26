import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_THEME, isTheme } from "./themes";
import {
  THEME_STORAGE_KEY,
  readStoredTheme,
  writeStoredTheme,
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

describe("theme storage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to Light when nothing is stored", () => {
    vi.stubGlobal("localStorage", createMemoryStorage());

    expect(readStoredTheme()).toBe(DEFAULT_THEME);
    expect(readStoredTheme()).toBe("light");
  });

  it("persists a supported theme and reads it back", () => {
    vi.stubGlobal("localStorage", createMemoryStorage());

    writeStoredTheme("dark");

    expect(readStoredTheme()).toBe("dark");
  });

  it("falls back to Light when the stored value is invalid", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("localStorage", storage);
    storage.setItem(THEME_STORAGE_KEY, "system");

    expect(readStoredTheme()).toBe("light");
  });

  it("defaults to Light when localStorage is unavailable", () => {
    vi.stubGlobal("localStorage", undefined);

    expect(readStoredTheme()).toBe("light");
    expect(() => writeStoredTheme("dark")).not.toThrow();
  });
});

describe("isTheme", () => {
  it("accepts only Light and Dark", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});
