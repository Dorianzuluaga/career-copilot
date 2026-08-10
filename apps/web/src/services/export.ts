import { apiUrl, ApiError } from "./api";

export type ExportDocumentType = "optimized-cv" | "cover-letter";

export interface ExportedDocumentFile {
  blob: Blob;
  filename: string;
}

function readFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return basicMatch?.[1] ?? null;
}

export async function exportApplicationDocument(
  applicationId: string,
  document: ExportDocumentType,
): Promise<ExportedDocumentFile> {
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/export`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document }),
    },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ApiError(body?.message ?? "Request failed.", response.status);
  }

  const blob = await response.blob();
  const filename =
    readFilename(response.headers.get("Content-Disposition")) ??
    (document === "optimized-cv" ? "cv.pdf" : "cover-letter.pdf");

  return { blob, filename };
}

export function triggerBrowserDownload(file: ExportedDocumentFile): void {
  const objectUrl = URL.createObjectURL(file.blob);
  const anchor = window.document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = file.filename;
  window.document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export { ApiError };
