import type { SVGProps } from "react";
import { useLocale } from "../hooks/useLocale";
import { useTheme } from "../hooks/useTheme";

const chromeClassName =
  "inline-flex items-center gap-2 rounded-md border border-white/15 bg-navy px-2 py-1.5 text-sm font-medium text-white outline-none transition hover:bg-navy-hover focus:border-white/40 focus:ring-2 focus:ring-white/20";

const pageClassName =
  "inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink outline-none transition hover:bg-canvas focus:border-brand focus:ring-2 focus:ring-brand-soft";

function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M12 4.25V2.5M12 21.5v-1.75M19.75 12H21.5M2.5 12h1.75M18.13 5.87l1.24-1.24M4.63 19.37l1.24-1.24M18.13 18.13l1.24 1.24M4.63 4.63l1.24 1.24M16.25 12a4.25 4.25 0 1 1-8.5 0 4.25 4.25 0 0 1 8.5 0Z"
      />
    </svg>
  );
}

function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M20.25 14.37A7.75 7.75 0 0 1 9.63 3.75 7.75 7.75 0 1 0 20.25 14.37Z"
      />
    </svg>
  );
}

export function ThemeToggle({ variant }: { variant: "chrome" | "page" }) {
  const { t } = useLocale();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={t("theme.toggle")}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={variant === "chrome" ? chromeClassName : pageClassName}
    >
      {isDark ? (
        <SunIcon className="h-4 w-4 shrink-0" />
      ) : (
        <MoonIcon className="h-4 w-4 shrink-0" />
      )}
    </button>
  );
}
