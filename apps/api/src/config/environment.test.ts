import { afterEach, describe, expect, it, vi } from "vitest";
import { validateEnvironment } from "./environment.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("environment configuration", () => {
  it("rejects startup when the OpenAI API key is missing", () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    expect(() => validateEnvironment()).toThrow(
      "Missing required API environment variable: OPENAI_API_KEY. Add it to apps/api/.env before starting the API.",
    );
  });

  it("accepts startup when the OpenAI API key exists", () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");

    expect(() => validateEnvironment()).not.toThrow();
  });
});
