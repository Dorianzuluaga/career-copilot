import { useLocale } from "../hooks/useLocale";
import { LOCALE_LABELS, SUPPORTED_LOCALES, isLocale } from "../i18n/locales";

export function LanguageSelector() {
  const { locale, setLocale, t } = useLocale();
  const label = t("languageSelector.label");

  return (
    <label className="ml-2 flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={locale}
        aria-label={label}
        onChange={(event) => {
          const nextLocale = event.target.value;
          if (isLocale(nextLocale)) {
            setLocale(nextLocale);
          }
        }}
        className="rounded-md border border-white/15 bg-navy px-2 py-1.5 text-sm font-medium text-white outline-none transition hover:bg-navy-hover focus:border-white/40 focus:ring-2 focus:ring-white/20"
      >
        {SUPPORTED_LOCALES.map((supportedLocale) => (
          <option key={supportedLocale} value={supportedLocale}>
            {LOCALE_LABELS[supportedLocale]}
          </option>
        ))}
      </select>
    </label>
  );
}
