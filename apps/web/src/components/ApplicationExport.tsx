import { useEffect, useRef, useState } from "react";
import { useLocale } from "../hooks/useLocale";
import type { TranslationKey } from "../i18n/messages";
import {
  isLocale,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type Locale,
} from "../i18n/locales";
import {
  ApiError,
  exportApplicationDocument,
  previewExportDocument,
  triggerBrowserDownload,
  type ExportDocumentType,
  type ExportPreviewResponse,
} from "../services/export";
import {
  readStoredPresentationLanguage,
  resolvePresentationLanguage,
  writeStoredPresentationLanguage,
} from "../services/presentation-language";
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

export function selectedExportDocuments(
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

export function exportRequestsForSelection(
  selection: ExportDocumentSelection,
  presentationLanguage: Locale,
): Array<{
  document: ExportDocumentType;
  presentationLanguage: Locale;
}> {
  return selectedExportDocuments(selection).map((document) => ({
    document,
    presentationLanguage,
  }));
}

type ExportPreviewCacheKey = {
  applicationId: string;
  document: ExportDocumentType;
  presentationLanguage: Locale;
};

type ExportPreviewCacheScope = {
  applicationId: string;
  presentationLanguage: Locale;
};

export type ExportPreviewCache = {
  get(
    applicationId: string,
    document: ExportDocumentType,
    presentationLanguage: Locale,
  ): ExportPreviewResponse | null;
  set(
    applicationId: string,
    document: ExportDocumentType,
    presentationLanguage: Locale,
    preview: ExportPreviewResponse,
  ): void;
  invalidateDocument(applicationId: string, document: ExportDocumentType): void;
  clear(): void;
};

export function createExportPreviewCache(): ExportPreviewCache {
  const entries = new Map<string, ExportPreviewResponse>();

  function key({
    applicationId,
    document,
    presentationLanguage,
  }: ExportPreviewCacheKey): string {
    return `${applicationId}:${document}:${presentationLanguage}`;
  }

  return {
    get(applicationId, document, presentationLanguage) {
      return (
        entries.get(key({ applicationId, document, presentationLanguage })) ??
        null
      );
    },
    set(applicationId, document, presentationLanguage, preview) {
      entries.set(
        key({ applicationId, document, presentationLanguage }),
        preview,
      );
    },
    invalidateDocument(applicationId, document) {
      const prefix = `${applicationId}:${document}:`;
      for (const entryKey of entries.keys()) {
        if (entryKey.startsWith(prefix)) {
          entries.delete(entryKey);
        }
      }
    },
    clear() {
      entries.clear();
    },
  };
}

export function shouldInvalidateExportPreviewCache(
  previous: ExportPreviewCacheScope | null,
  next: ExportPreviewCacheScope,
): boolean {
  return previous !== null && previous.applicationId !== next.applicationId;
}

export function readCachedExportPreview(
  cache: ExportPreviewCache,
  previousScope: ExportPreviewCacheScope | null,
  scope: ExportPreviewCacheScope,
  document: ExportDocumentType,
): ExportPreviewResponse | null {
  if (shouldInvalidateExportPreviewCache(previousScope, scope)) {
    cache.clear();
  }
  return cache.get(scope.applicationId, document, scope.presentationLanguage);
}

interface ExportPreviewPanelProps {
  applicationId: string;
  preview: ExportPreviewResponse;
}

export function ExportPreviewPanel({
  applicationId,
  preview,
}: ExportPreviewPanelProps) {
  const { t } = useLocale();

  return (
    <div
      role="tabpanel"
      data-presentation-language={preview.presentationLanguage}
      aria-label={
        preview.document === "optimized-cv"
          ? t("export.optimizedCv")
          : t("export.coverLetter")
      }
    >
      {preview.document === "optimized-cv" ? (
        <OptimizedCvDocument
          cv={preview.data}
          applicationId={applicationId}
          chrome={preview.chrome}
        />
      ) : (
        <CoverLetterDocument
          coverLetter={preview.data}
          chrome={preview.chrome}
        />
      )}
    </div>
  );
}

interface ApplicationExportProps {
  applicationId: string;
  coverLetter: CoverLetter | null;
  optimizedCv: OptimizedCv | null;
  previewCache: ExportPreviewCache;
}

export function ApplicationExport({
  applicationId,
  coverLetter,
  optimizedCv,
  previewCache,
}: ApplicationExportProps) {
  const { locale, t } = useLocale();
  const [activePreview, setActivePreview] =
    useState<PreviewDocument>("optimized-cv");
  const [selectedDocuments, setSelectedDocuments] =
    useState<ExportDocumentSelection>(defaultExportSelection);
  const [presentationLanguage, setPresentationLanguage] = useState<Locale>(() =>
    resolvePresentationLanguage(readStoredPresentationLanguage(), locale),
  );
  const hasPreviewDocuments = optimizedCv !== null && coverLetter !== null;
  const [preview, setPreview] = useState<ExportPreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(hasPreviewDocuments);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const previewCacheScopeRef = useRef<ExportPreviewCacheScope | null>(null);

  const isOptimizedCvSelectionLocked =
    selectedDocuments.optimizedCv && !selectedDocuments.coverLetter;
  const isCoverLetterSelectionLocked =
    selectedDocuments.coverLetter && !selectedDocuments.optimizedCv;

  useEffect(() => {
    if (!hasPreviewDocuments) {
      previewCacheScopeRef.current = null;
      setPreview(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
      return;
    }

    const scope = { applicationId, presentationLanguage };
    const cachedPreview = readCachedExportPreview(
      previewCache,
      previewCacheScopeRef.current,
      scope,
      activePreview,
    );
    previewCacheScopeRef.current = scope;

    if (cachedPreview) {
      setPreview(cachedPreview);
      setPreviewError(null);
      setIsPreviewLoading(false);
      return;
    }

    let cancelled = false;
    setIsPreviewLoading(true);
    setPreview(null);
    setPreviewError(null);

    void previewExportDocument(
      applicationId,
      activePreview,
      presentationLanguage,
    )
      .then((result) => {
        previewCache.set(
          applicationId,
          activePreview,
          presentationLanguage,
          result,
        );
        if (cancelled) {
          return;
        }
        setPreview(result);
        setIsPreviewLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setPreviewError(
          error instanceof ApiError ? error.message : t("export.previewFailed"),
        );
        setIsPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    activePreview,
    applicationId,
    hasPreviewDocuments,
    presentationLanguage,
    previewCache,
    t,
  ]);

  function handlePresentationLanguageChange(nextLanguage: string) {
    if (!isLocale(nextLanguage)) {
      return;
    }
    setPresentationLanguage(nextLanguage);
    writeStoredPresentationLanguage(nextLanguage);
  }

  async function handleDownload() {
    const requests = exportRequestsForSelection(
      selectedDocuments,
      presentationLanguage,
    );
    if (requests.length === 0 || isDownloading) {
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      for (const request of requests) {
        const file = await exportApplicationDocument(
          applicationId,
          request.document,
          request.presentationLanguage,
        );
        triggerBrowserDownload(file);
      }
    } catch (error) {
      setDownloadError(
        error instanceof ApiError ? error.message : t("export.downloadFailed"),
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
                {t("export.presentationLanguage")}
              </legend>
              <p className="mt-1 text-sm leading-6 text-muted">
                {t("export.presentationLanguageHelp")}
              </p>
              <label className="mt-3 block max-w-xs text-sm font-medium text-ink">
                <span className="sr-only">
                  {t("export.presentationLanguage")}
                </span>
                <select
                  value={presentationLanguage}
                  aria-label={t("export.presentationLanguage")}
                  onChange={(event) =>
                    handlePresentationLanguageChange(event.target.value)
                  }
                  className="cc-field mt-1"
                >
                  {SUPPORTED_LOCALES.map((supportedLocale) => (
                    <option key={supportedLocale} value={supportedLocale}>
                      {LOCALE_LABELS[supportedLocale]}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>

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

      {hasPreviewDocuments ? (
        previewError ? (
          <section className="cc-card p-6 text-center sm:p-8">
            <p className="text-sm leading-6 text-danger" role="alert">
              {previewError}
            </p>
          </section>
        ) : preview && !isPreviewLoading ? (
          <ExportPreviewPanel applicationId={applicationId} preview={preview} />
        ) : (
          <section className="cc-card p-6 text-center sm:p-8">
            <p className="text-sm leading-6 text-muted" role="status">
              {t("export.previewLoading")}
            </p>
          </section>
        )
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
