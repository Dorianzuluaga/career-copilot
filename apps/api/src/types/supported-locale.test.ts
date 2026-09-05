import { describe, expect, it } from "vitest";
import {
  isSupportedLocale,
  parseNullableSupportedLocale,
  SUPPORTED_LOCALES,
  validateSupportedLocale,
} from "./supported-locale.js";

describe("supported locale contract", () => {
  it("supports exactly es, en, and fr", () => {
    expect(SUPPORTED_LOCALES).toEqual(["es", "en", "fr"]);
    expect(SUPPORTED_LOCALES.every(isSupportedLocale)).toBe(true);
  });

  it.each([undefined, null, "", "de", 42])(
    "rejects unsupported locale %s",
    (value) => {
      expect(() => validateSupportedLocale(value)).toThrow(
        'locale must be one of "es", "en", or "fr".',
      );
    },
  );

  it("parses missing and null values as null without substituting a locale", () => {
    expect(parseNullableSupportedLocale(undefined)).toBeNull();
    expect(parseNullableSupportedLocale(null)).toBeNull();
    expect(parseNullableSupportedLocale("es")).toBe("es");
  });

  it("rejects unsupported persisted Working Language values", () => {
    expect(() => parseNullableSupportedLocale("de", "workingLanguage")).toThrow(
      'workingLanguage must be one of "es", "en", or "fr".',
    );
  });

  it.each(["es", "en", "fr"] as const)(
    "accepts presentationLanguage %s with the shared locale guard",
    (locale) => {
      expect(validateSupportedLocale(locale, "presentationLanguage")).toBe(
        locale,
      );
    },
  );

  it.each([undefined, null, "", "de", 42])(
    "rejects unsupported presentationLanguage %s",
    (value) => {
      expect(() =>
        validateSupportedLocale(value, "presentationLanguage"),
      ).toThrow('presentationLanguage must be one of "es", "en", or "fr".');
    },
  );
});
