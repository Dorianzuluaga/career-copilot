import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "../components/ThemeToggle";
import { LocaleProvider } from "../context/LocaleProvider";
import { ThemeProvider } from "../context/ThemeProvider";
import { useTheme } from "../hooks/useTheme";
import { writeStoredTheme } from "./storage";

function ThemeProbe() {
  const { theme } = useTheme();
  return <p>{theme}</p>;
}

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

describe("ThemeProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults the reusable theme hook to Light", () => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    const markup = renderToStaticMarkup(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(markup).toContain("light");
  });

  it("restores the stored theme after a reload", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("localStorage", storage);
    writeStoredTheme("dark");

    const markup = renderToStaticMarkup(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(markup).toContain("dark");
  });
});

describe("ThemeToggle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exposes an accessible name and shows the Moon icon to switch from Light", () => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <ThemeProvider>
          <ThemeToggle variant="page" />
        </ThemeProvider>
      </LocaleProvider>,
    );

    expect(markup).toContain('aria-label="Tema"');
    expect(markup).toContain('aria-pressed="false"');
    expect(markup).toContain("M20.25 14.37A7.75 7.75 0 0 1 9.63 3.75");
    expect(markup).not.toContain("M12 4.25V2.5");
    expect(markup).not.toContain(">Claro<");
    expect(markup).toContain('type="button"');
  });

  it("shows the Sun icon to switch from Dark when that theme is stored", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("localStorage", storage);
    writeStoredTheme("dark");

    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <ThemeProvider>
          <ThemeToggle variant="chrome" />
        </ThemeProvider>
      </LocaleProvider>,
    );

    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain("M12 4.25V2.5");
    expect(markup).not.toContain("M20.25 14.37A7.75 7.75 0 0 1 9.63 3.75");
    expect(markup).not.toContain(">Oscuro<");
  });
});

describe("useTheme", () => {
  it("requires the theme provider", () => {
    expect(() => renderToStaticMarkup(<ThemeProbe />)).toThrow(
      "useTheme must be used within a ThemeProvider.",
    );
  });
});
