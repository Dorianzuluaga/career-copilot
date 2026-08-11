import { describe, expect, it } from "vitest";
import { deepEqual } from "./deepEqual";

describe("deepEqual", () => {
  it("compares primitives and nullish values", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual("a", "a")).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
  });

  it("compares nested objects and arrays by value", () => {
    expect(
      deepEqual(
        { name: "Taylor", skills: ["TypeScript", "React"] },
        { name: "Taylor", skills: ["TypeScript", "React"] },
      ),
    ).toBe(true);
    expect(
      deepEqual(
        { name: "Taylor", skills: ["TypeScript"] },
        { name: "Taylor", skills: ["TypeScript", "React"] },
      ),
    ).toBe(false);
  });
});
