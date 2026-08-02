import type { ProfileComparison } from "../types/profile-comparison";
import { apiUrl, readResponse } from "./api";

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
