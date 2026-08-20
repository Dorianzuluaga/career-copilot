import { createContext } from "react";
import type { Locale } from "../i18n/locales";
import type { TranslationKey } from "../i18n/messages";
import type { TranslationValues } from "../i18n/translate";

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);
