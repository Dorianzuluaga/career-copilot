import { useRef, useState } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleImport(file: File) {
    setErrorMessage(null);
    setIsImporting(true);
    try {
      const extraction = await uploadMasterCv(file);
      const confirmed = window.confirm(
        "Replace the current editor data with the information extracted from this CV? Nothing will be updated until you save.",
      );

      if (!confirmed) return;

      onImport(masterCvInputFromExtraction(extraction));
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "We couldn't extract your CV automatically.",
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
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleImport(file);
        }}
      />
      <button
        type="button"
        disabled={isImporting}
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex w-fit items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isImporting ? "Importing…" : "Import Existing CV"}
      </button>
      {errorMessage ? (
        <p role="alert" className="max-w-sm text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
