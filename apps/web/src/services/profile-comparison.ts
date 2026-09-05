import type { Locale } from "../i18n/locales";
import type { ProfileComparison } from "../types/profile-comparison";
import { apiUrl, ApiError, readResponse } from "./api";

export async function compareProfile(
  applicationId: string,
  locale: Locale,
): Promise<ProfileComparison> {
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/profile-comparison`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
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
