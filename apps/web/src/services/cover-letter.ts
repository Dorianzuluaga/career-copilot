import type { Locale } from "../i18n/locales";
import type {
  CoverLetter,
  GeneratedCoverLetterDraft,
} from "../types/cover-letter";
import { apiUrl, ApiError, readResponse } from "./api";

export async function generateCoverLetter(
  applicationId: string,
  locale: Locale,
): Promise<GeneratedCoverLetterDraft> {
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/cover-letter`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    },
  );

  const result = await readResponse<{
    coverLetter: GeneratedCoverLetterDraft;
  }>(response);
  return result.coverLetter;
}

export async function getCoverLetter(
  applicationId: string,
): Promise<CoverLetter | null> {
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/cover-letter`,
    {
      credentials: "include",
    },
  );
  if (response.status === 404) return null;
  const result = await readResponse<{ coverLetter: CoverLetter }>(response);
  return result.coverLetter;
}

export async function saveCoverLetter(
  applicationId: string,
  coverLetter: CoverLetter,
): Promise<CoverLetter> {
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/cover-letter`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coverLetter),
    },
  );

  const result = await readResponse<{ coverLetter: CoverLetter }>(response);
  return result.coverLetter;
}

export { ApiError };
