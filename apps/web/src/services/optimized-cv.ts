import type { OptimizedCv } from "../types/optimized-cv";
import { apiUrl, ApiError, readResponse } from "./api";

export async function generateOptimizedCv(
  applicationId: string,
): Promise<OptimizedCv> {
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/optimized-cv`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const result = await readResponse<{ optimizedCv: OptimizedCv }>(response);
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
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/optimized-cv`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(optimizedCv),
    },
  );

  const result = await readResponse<{ optimizedCv: OptimizedCv }>(response);
  return result.optimizedCv;
}

export { ApiError };
