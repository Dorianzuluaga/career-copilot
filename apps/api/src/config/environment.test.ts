import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getFrontendOrigin,
  isProduction,
  validateEnvironment,
} from "./environment.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

function stubRequiredEnvironment() {
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubEnv(
    "DATABASE_URL",
    "postgresql://username:password@localhost:5432/career_copilot",
  );
  vi.stubEnv(
    "GOOGLE_APPLICATION_CREDENTIALS",
    "/tmp/firebase-service-account.json",
  );
  vi.stubEnv("NODE_ENV", "test");
}

describe("environment configuration", () => {
  it("rejects startup when the OpenAI API key is missing", () => {
    stubRequiredEnvironment();
    vi.stubEnv("OPENAI_API_KEY", "");

    expect(() => validateEnvironment()).toThrow(
      "Missing required API environment variable: OPENAI_API_KEY. Set it in apps/api/.env for local development or in the hosting provider's environment for production.",
    );
  });

  it("rejects startup when the database URL is missing", () => {
    stubRequiredEnvironment();
    vi.stubEnv("DATABASE_URL", "");

    expect(() => validateEnvironment()).toThrow(
      "Missing required API environment variable: DATABASE_URL. Set it in apps/api/.env for local development or in the hosting provider's environment for production.",
    );
  });

  it("rejects startup when Firebase Admin credentials are missing", () => {
    stubRequiredEnvironment();
    vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", "");
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT", "");

    expect(() => validateEnvironment()).toThrow(
      "Missing required API environment variable: FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS. Set it in apps/api/.env for local development or in the hosting provider's environment for production.",
    );
  });

  it("rejects production startup when the frontend origin is missing", () => {
    stubRequiredEnvironment();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FRONTEND_ORIGIN", "");

    expect(() => validateEnvironment()).toThrow(
      "Missing required API environment variable: FRONTEND_ORIGIN. Set it in apps/api/.env for local development or in the hosting provider's environment for production.",
    );
  });

  it("rejects production startup when the frontend origin is not a URL", () => {
    stubRequiredEnvironment();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FRONTEND_ORIGIN", "not-a-url");

    expect(() => validateEnvironment()).toThrow(
      "FRONTEND_ORIGIN must be a valid origin URL, for example https://app.example.com.",
    );
  });

  it("accepts startup when required local variables exist", () => {
    stubRequiredEnvironment();

    expect(() => validateEnvironment()).not.toThrow();
  });

  it("accepts Firebase Admin JSON credentials instead of a credentials file", () => {
    stubRequiredEnvironment();
    vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", "");
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT", '{"type":"service_account"}');

    expect(() => validateEnvironment()).not.toThrow();
  });

  it("defaults the frontend origin to the local Vite URL", () => {
    vi.stubEnv("FRONTEND_ORIGIN", "");

    expect(getFrontendOrigin()).toBe("http://localhost:5173");
  });

  it("normalizes a configured frontend origin", () => {
    vi.stubEnv("FRONTEND_ORIGIN", "https://app.example.com/");

    expect(getFrontendOrigin()).toBe("https://app.example.com");
  });

  it("detects production from NODE_ENV", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isProduction()).toBe(true);

    vi.stubEnv("NODE_ENV", "development");
    expect(isProduction()).toBe(false);
  });
});
