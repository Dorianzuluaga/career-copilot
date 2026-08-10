export function slugifyFilenamePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function candidateNameSlug(fullName: string): string {
  const slug = slugifyFilenamePart(fullName);
  return slug.length > 0 ? slug : "candidate";
}

export function buildOptimizedCvFilename(
  fullName: string,
  professionalTitle: string | null | undefined,
): string {
  const candidateName = candidateNameSlug(fullName);
  const title =
    typeof professionalTitle === "string"
      ? slugifyFilenamePart(professionalTitle)
      : "";

  if (title.length > 0) {
    return `${candidateName}_${title}_cv.pdf`;
  }

  return `${candidateName}_cv.pdf`;
}

export function buildCoverLetterFilename(fullName: string): string {
  return `${candidateNameSlug(fullName)}_cover-letter.pdf`;
}

export function readOptionalProfessionalTitle(masterCv: unknown): string | null {
  if (!masterCv || typeof masterCv !== "object") {
    return null;
  }

  const value = (masterCv as { professionalTitle?: unknown }).professionalTitle;
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
