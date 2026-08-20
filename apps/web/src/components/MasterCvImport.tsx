import { useRef, useState } from "react";
import { useLocale } from "../hooks/useLocale";
import {
  ApiError,
  masterCvInputFromExtraction,
  uploadMasterCv,
} from "../services/master-cv";
import type { MasterCvInput } from "../types/master-cv";

export function MasterCvImport({
  onImport,
}: {
  onImport: (input: MasterCvInput) => void;
}) {
  const { t } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleImport(file: File) {
    setErrorMessage(null);
    setIsImporting(true);
    try {
      const extraction = await uploadMasterCv(file);
      const confirmed = window.confirm(t("masterCv.import.confirm"));

      if (!confirmed) return;

      onImport(masterCvInputFromExtraction(extraction));
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : t("masterCv.import.extractFailed"),
      );
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        aria-label={t("masterCv.import.fileLabel")}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleImport(file);
        }}
      />
      <button
        type="button"
        disabled={isImporting}
        onClick={() => fileInputRef.current?.click()}
        className="cc-btn-secondary w-fit"
      >
        {isImporting
          ? t("masterCv.import.importing")
          : t("masterCv.import.action")}
      </button>
      {errorMessage ? (
        <p role="alert" className="max-w-sm text-sm font-medium text-danger">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
