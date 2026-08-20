import { useState } from "react";
import { useLocale } from "../hooks/useLocale";
import type { TranslationKey } from "../i18n/messages";
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
  { id: "optimized-cv", labelKey: "export.optimizedCv" },
  { id: "cover-letter", labelKey: "export.coverLetter" },
] as const satisfies ReadonlyArray<{
  id: string;
  labelKey: TranslationKey;
}>;

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
  const { t } = useLocale();
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
          : t("export.downloadFailed"),
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="export-title" className="cc-card p-6 sm:p-8">
        <p className="cc-kicker">{t("export.kicker")}</p>
        <h2 id="export-title" className="mt-1 text-2xl font-bold text-ink">
          {t("export.title")}
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted">
          {t("export.description")}
        </p>

        {hasPreviewDocuments ? (
          <>
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-ink">
                {t("export.documentsToDownload")}
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
                  {t("export.optimizedCv")}
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
                  {t("export.coverLetter")}
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
                {isDownloading ? t("export.downloading") : t("export.download")}
              </button>
              {downloadError ? (
                <p className="text-sm text-danger" role="alert">
                  {downloadError}
                </p>
              ) : null}
            </div>

            <div
              role="tablist"
              aria-label={t("export.previewAria")}
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
                    {t(document.labelKey)}
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
            activePreview === "optimized-cv"
              ? t("export.optimizedCv")
              : t("export.coverLetter")
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
            {t("export.requiresDocuments")}
          </p>
        </section>
      )}
    </div>
  );
}
