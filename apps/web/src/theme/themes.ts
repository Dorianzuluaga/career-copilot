export const SUPPORTED_THEMES = ["light", "dark"] as const;

export type Theme = (typeof SUPPORTED_THEMES)[number];

export const DEFAULT_THEME: Theme = "light";

export function isTheme(value: unknown): value is Theme {
  return (
    typeof value === "string" &&
    (SUPPORTED_THEMES as readonly string[]).includes(value)
  );
}
