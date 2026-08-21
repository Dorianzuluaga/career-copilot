const requiredVariables = ["OPENAI_API_KEY", "DATABASE_URL"] as const;
const defaultFrontendOrigin = "http://localhost:5173";

function missingRequiredVariables(): string[] {
  const missing: string[] = requiredVariables.filter(
    (name) => !process.env[name]?.trim(),
  );

  if (
    !process.env.FIREBASE_SERVICE_ACCOUNT?.trim() &&
    !process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()
  ) {
    missing.push("FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS");
  }

  if (isProduction() && !process.env.FRONTEND_ORIGIN?.trim()) {
    missing.push("FRONTEND_ORIGIN");
  }

  return missing;
}

function missingEnvironmentError(missingVariables: string[]): Error {
  const plural = missingVariables.length > 1;
  return new Error(
    `Missing required API environment variable${plural ? "s" : ""}: ${missingVariables.join(", ")}. Set ${plural ? "them" : "it"} in apps/api/.env for local development or in the hosting provider's environment for production.`,
  );
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getFrontendOrigin(): string {
  const configured =
    process.env.FRONTEND_ORIGIN?.trim() || defaultFrontendOrigin;

  try {
    return new URL(configured).origin;
  } catch {
    return configured.replace(/\/$/, "");
  }
}

export function validateEnvironment(): void {
  const missingVariables = missingRequiredVariables();

  if (missingVariables.length > 0) {
    throw missingEnvironmentError(missingVariables);
  }

  if (isProduction()) {
    try {
      new URL(process.env.FRONTEND_ORIGIN!.trim());
    } catch {
      throw new Error(
        "FRONTEND_ORIGIN must be a valid origin URL, for example https://app.example.com.",
      );
    }
  }
}
