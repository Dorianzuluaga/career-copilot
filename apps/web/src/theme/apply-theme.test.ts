import { afterEach, describe, expect, it, vi } from "vitest";
import { applyThemeToDocument } from "./apply-theme";

function createDocumentElement() {
  const classNames = new Set<string>();

  return {
    classList: {
      toggle(className: string, force?: boolean) {
        if (force === undefined) {
          if (classNames.has(className)) {
            classNames.delete(className);
            return false;
          }
          classNames.add(className);
          return true;
        }
        if (force) {
          classNames.add(className);
        } else {
          classNames.delete(className);
        }
        return force;
      },
      contains(className: string) {
        return classNames.has(className);
      },
    },
    style: { colorScheme: "" },
  };
}

describe("applyThemeToDocument", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("applies Dark class and color-scheme", () => {
    const documentElement = createDocumentElement();
    vi.stubGlobal("document", { documentElement });

    applyThemeToDocument("dark");

    expect(documentElement.classList.contains("dark")).toBe(true);
    expect(documentElement.style.colorScheme).toBe("dark");
  });

  it("removes Dark class for Light", () => {
    const documentElement = createDocumentElement();
    vi.stubGlobal("document", { documentElement });
    applyThemeToDocument("dark");

    applyThemeToDocument("light");

    expect(documentElement.classList.contains("dark")).toBe(false);
    expect(documentElement.style.colorScheme).toBe("light");
  });
});
