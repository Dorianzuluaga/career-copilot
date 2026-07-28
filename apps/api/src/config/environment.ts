const requiredOpenAiVariables = ["OPENAI_API_KEY"] as const;

export function validateEnvironment(): void {
  const missingVariables = requiredOpenAiVariables.filter(
    (name) => !process.env[name]?.trim(),
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required API environment variable${missingVariables.length > 1 ? "s" : ""}: ${missingVariables.join(", ")}. Add ${missingVariables.length > 1 ? "them" : "it"} to apps/api/.env before starting the API.`,
    );
  }
}
