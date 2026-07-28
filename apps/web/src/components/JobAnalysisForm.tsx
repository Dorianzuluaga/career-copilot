import type { FormEvent } from "react";

interface JobAnalysisFormProps {
  description: string;
  isAnalyzing: boolean;
  extractionError: string | null;
  retryingStoredOffer: boolean;
  onDescriptionChange: (description: string) => void;
  onAnalyze: (description: string) => Promise<void>;
  onCancel: () => void;
}

const MIN_DESCRIPTION_LENGTH = 300;
const MAX_DESCRIPTION_LENGTH = 25_000;

function hasUnsupportedControlCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return (
      (code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 127
    );
  });
}

export function jobDescriptionError(description: string): string | null {
  if (description.trim() === "") return "Job description is required.";
  if (description.length < MIN_DESCRIPTION_LENGTH) {
    return "The job description is too short.";
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return "The job description exceeds the maximum allowed length.";
  }
  if (hasUnsupportedControlCharacters(description)) {
    return "Job description must be plain text.";
  }
  return null;
}

export function JobAnalysisForm({
  description,
  isAnalyzing,
  extractionError,
  retryingStoredOffer,
  onDescriptionChange,
  onAnalyze,
  onCancel,
}: JobAnalysisFormProps) {
  const validationError = jobDescriptionError(description);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (validationError || isAnalyzing) return;
    void onAnalyze(description);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <div>
        <div className="flex items-end justify-between gap-4">
          <label
            htmlFor="jobDescription"
            className="text-sm font-semibold text-slate-800"
          >
            Job description
          </label>
          <span
            className={`text-xs ${
              description.length > MAX_DESCRIPTION_LENGTH
                ? "font-semibold text-red-700"
                : "text-slate-500"
            }`}
          >
            {description.length.toLocaleString()} /{" "}
            {MAX_DESCRIPTION_LENGTH.toLocaleString()}
          </span>
        </div>
        <textarea
          id="jobDescription"
          name="jobDescription"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={isAnalyzing}
          className="mt-2 min-h-80 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-wait disabled:bg-slate-50"
          placeholder="Paste the complete job description here…"
          aria-describedby="job-description-help job-description-error"
          aria-invalid={Boolean(validationError)}
          required
        />
        <p id="job-description-help" className="mt-2 text-xs text-slate-500">
          Plain text only. Enter between 300 and 25,000 characters.
        </p>
        {validationError && (
          <p
            id="job-description-error"
            className="mt-2 text-sm font-medium text-red-700"
          >
            {validationError}
          </p>
        )}
      </div>

      {extractionError && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <p className="font-semibold text-red-900">Analysis failed</p>
          <p className="mt-1 text-sm text-red-800">{extractionError}</p>
          <p className="mt-2 text-xs text-red-700">
            {retryingStoredOffer
              ? "Retry to analyze the stored original. Editing the text will start a new application."
              : "Review the description and try again."}
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isAnalyzing}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={Boolean(validationError) || isAnalyzing}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isAnalyzing
            ? "Analyzing job description…"
            : retryingStoredOffer
              ? "Retry analysis"
              : "Analyze job"}
        </button>
      </div>
    </form>
  );
}
