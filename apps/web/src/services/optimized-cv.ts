import type { OptimizedCv } from "../types/optimized-cv";
import { apiUrl, readResponse } from "./api";

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
