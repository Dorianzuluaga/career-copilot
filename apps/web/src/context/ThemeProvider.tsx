import { useCallback, useMemo, useState, type ReactNode } from "react";
import { applyThemeToDocument } from "../theme/apply-theme";
import { readStoredTheme, writeStoredTheme } from "../theme/storage";
import type { Theme } from "../theme/themes";
import { ThemeContext } from "./theme-context";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = readStoredTheme();
    applyThemeToDocument(storedTheme);
    return storedTheme;
  });

  const setTheme = useCallback((nextTheme: Theme) => {
    writeStoredTheme(nextTheme);
    applyThemeToDocument(nextTheme);
    setThemeState(nextTheme);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
