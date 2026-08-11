import type { ProfileComparison } from "../types/profile-comparison";
import { apiUrl, ApiError, readResponse } from "./api";

export async function compareProfile(
  applicationId: string,
): Promise<ProfileComparison> {
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/profile-comparison`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  return readResponse<ProfileComparison>(response);
}

export async function getProfileComparison(
  applicationId: string,
): Promise<ProfileComparison | null> {
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/profile-comparison`,
    {
      credentials: "include",
    },
  );
  if (response.status === 404) return null;
  return readResponse<ProfileComparison>(response);
}

export { ApiError };
