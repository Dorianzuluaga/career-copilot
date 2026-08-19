import { useState } from "react";
import {
  ApiError,
  exportApplicationDocument,
  triggerBrowserDownload,
  type ExportDocumentType,
} from "../services/export";
import type { CoverLetter } from "../types/cover-letter";
import type { OptimizedCv } from "../types/optimized-cv";
import { CoverLetterDocument } from "./ApplicationCoverLetter";
import { OptimizedCvDocument } from "./ApplicationOptimizedCv";

const previewDocuments = [
  { id: "optimized-cv", label: "Optimized CV" },
  { id: "cover-letter", label: "Cover Letter" },
] as const;

type PreviewDocument = (typeof previewDocuments)[number]["id"];

export type ExportDocumentSelection = {
  optimizedCv: boolean;
  coverLetter: boolean;
};

const defaultExportSelection: ExportDocumentSelection = {
  optimizedCv: true,
  coverLetter: true,
};

export function updateDocumentSelection(
  selection: ExportDocumentSelection,
  key: keyof ExportDocumentSelection,
  checked: boolean,
): ExportDocumentSelection {
  const next = { ...selection, [key]: checked };

  if (!next.optimizedCv && !next.coverLetter) {
    return selection;
  }

  return next;
}

function selectedExportDocuments(
  selection: ExportDocumentSelection,
): ExportDocumentType[] {
  const documents: ExportDocumentType[] = [];
  if (selection.optimizedCv) {
    documents.push("optimized-cv");
  }
  if (selection.coverLetter) {
    documents.push("cover-letter");
  }
  return documents;
}

interface ApplicationExportProps {
  applicationId: string;
  coverLetter: CoverLetter | null;
  optimizedCv: OptimizedCv | null;
}

export function ApplicationExport({
  applicationId,
  coverLetter,
  optimizedCv,
}: ApplicationExportProps) {
  const [activePreview, setActivePreview] =
    useState<PreviewDocument>("optimized-cv");
  const [selectedDocuments, setSelectedDocuments] =
    useState<ExportDocumentSelection>(defaultExportSelection);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const previewDocument =
    activePreview === "optimized-cv" ? optimizedCv : coverLetter;
  const hasPreviewDocuments = optimizedCv !== null && coverLetter !== null;
  const isOptimizedCvSelectionLocked =
    selectedDocuments.optimizedCv && !selectedDocuments.coverLetter;
  const isCoverLetterSelectionLocked =
    selectedDocuments.coverLetter && !selectedDocuments.optimizedCv;

  async function handleDownload() {
    const documents = selectedExportDocuments(selectedDocuments);
    if (documents.length === 0 || isDownloading) {
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      for (const document of documents) {
        const file = await exportApplicationDocument(applicationId, document);
        triggerBrowserDownload(file);
      }
    } catch (error) {
      setDownloadError(
        error instanceof ApiError
          ? error.message
          : "Unable to download the selected documents.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="export-title" className="cc-card p-6 sm:p-8">
        <p className="cc-kicker">Application documents</p>
        <h2 id="export-title" className="mt-1 text-2xl font-bold text-ink">
          Export
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted">
          Preview the latest saved application documents and choose which ones
          will be downloaded. Editing is available in the Optimized CV and Cover
          Letter sections.
        </p>

        {hasPreviewDocuments ? (
          <>
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-ink">
                Documents to download
              </legend>
              <div className="mt-3 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.optimizedCv}
                    disabled={isOptimizedCvSelectionLocked || isDownloading}
                    onChange={(event) =>
                      setSelectedDocuments((current) =>
                        updateDocumentSelection(
                          current,
                          "optimizedCv",
                          event.target.checked,
                        ),
                      )
                    }
                  />
                  Optimized CV
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.coverLetter}
                    disabled={isCoverLetterSelectionLocked || isDownloading}
                    onChange={(event) =>
                      setSelectedDocuments((current) =>
                        updateDocumentSelection(
                          current,
                          "coverLetter",
                          event.target.checked,
                        ),
                      )
                    }
                  />
                  Cover Letter
                </label>
              </div>
            </fieldset>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={isDownloading}
                className="cc-btn-primary"
              >
                {isDownloading ? "Downloading…" : "Download"}
              </button>
              {downloadError ? (
                <p className="text-sm text-danger" role="alert">
                  {downloadError}
                </p>
              ) : null}
            </div>

            <div
              role="tablist"
              aria-label="Document preview"
              className="mt-6 flex flex-wrap gap-2"
            >
              {previewDocuments.map((document) => {
                const isActive = document.id === activePreview;

                return (
                  <button
                    key={document.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActivePreview(document.id)}
                    className={isActive ? "cc-tab-active" : "cc-tab"}
                  >
                    {document.label}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </section>

      {hasPreviewDocuments && previewDocument ? (
        <div
          role="tabpanel"
          aria-label={
            activePreview === "optimized-cv" ? "Optimized CV" : "Cover Letter"
          }
        >
          {activePreview === "optimized-cv" && optimizedCv ? (
            <OptimizedCvDocument cv={optimizedCv} />
          ) : coverLetter ? (
            <CoverLetterDocument coverLetter={coverLetter} />
          ) : null}
        </div>
      ) : (
        <section className="cc-card p-6 text-center sm:p-8">
          <p className="text-sm leading-6 text-muted">
            Saved Optimized CV and Cover Letter are required before documents
            can be previewed.
          </p>
        </section>
      )}
    </div>
  );
}
