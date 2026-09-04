import type { Locale } from "../i18n/locales";
import type {
  GeneratedOptimizedCvDraft,
  OptimizedCv,
} from "../types/optimized-cv";
import { apiUrl, ApiError, readResponse } from "./api";

export async function generateOptimizedCv(
  applicationId: string,
  locale: Locale,
): Promise<GeneratedOptimizedCvDraft> {
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/optimized-cv`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    },
  );

  const result = await readResponse<{
    optimizedCv: GeneratedOptimizedCvDraft;
  }>(response);
  return result.optimizedCv;
}

export async function getOptimizedCv(
  applicationId: string,
): Promise<OptimizedCv | null> {
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/optimized-cv`,
    {
      credentials: "include",
    },
  );
  if (response.status === 404) return null;
  const result = await readResponse<{ optimizedCv: OptimizedCv }>(response);
  return result.optimizedCv;
}

export async function saveOptimizedCv(
  applicationId: string,
  optimizedCv: OptimizedCv,
): Promise<OptimizedCv> {
  const persistableOptimizedCv = { ...optimizedCv };
  delete persistableOptimizedCv.workingLanguage;
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/optimized-cv`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(persistableOptimizedCv),
    },
  );

  const result = await readResponse<{ optimizedCv: OptimizedCv }>(response);
  return result.optimizedCv;
}

export function optimizedCvPhotoUrl(
  applicationId: string,
  assetId: string,
): string {
  return `${apiUrl}/api/applications/${applicationId}/optimized-cv/photo?assetId=${encodeURIComponent(assetId)}`;
}

export { ApiError };
