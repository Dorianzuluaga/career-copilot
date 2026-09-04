import { describe, expect, it } from "vitest";
import {
  isSupportedLocale,
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
});
