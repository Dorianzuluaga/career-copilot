import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageSelector } from "../components/LanguageSelector";
import { LocaleProvider } from "../context/LocaleProvider";
import { useLocale } from "../hooks/useLocale";
import { writeStoredLocale } from "./storage";

function LocaleProbe() {
  const { locale, t } = useLocale();
  return <p>{`${locale}:${t("languageSelector.label")}`}</p>;
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

describe("LocaleProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults the reusable language hook to Spanish", () => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>,
    );

    expect(markup).toContain("es:Idioma");
  });

  it("restores the stored language after a reload", () => {
    const storage = createMemoryStorage();
    vi.stubGlobal("localStorage", storage);
    writeStoredLocale("en");

    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>,
    );

    expect(markup).toContain("en:Language");
  });
});

describe("LanguageSelector", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders native language names for the supported locales", () => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <LanguageSelector />
      </LocaleProvider>,
    );

    expect(markup).toContain('aria-label="Idioma"');
    expect(markup).toContain(">Español<");
    expect(markup).toContain(">English<");
    expect(markup).toContain(">Français<");
  });
});

describe("useLocale", () => {
  it("requires the language provider", () => {
    expect(() => renderToStaticMarkup(<LocaleProbe />)).toThrow(
      "useLocale must be used within a LocaleProvider.",
    );
  });
});
