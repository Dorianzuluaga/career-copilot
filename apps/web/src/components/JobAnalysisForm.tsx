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
    <form onSubmit={handleSubmit} className="cc-card p-5 sm:p-8">
      <div>
        <div className="flex items-end justify-between gap-4">
          <label
            htmlFor="jobDescription"
            className="text-sm font-semibold text-ink"
          >
            Job description
          </label>
          <span
            className={`text-xs ${
              description.length > MAX_DESCRIPTION_LENGTH
                ? "font-semibold text-danger"
                : "text-muted"
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
          className="cc-field mt-2 min-h-80 resize-y px-3 py-3 disabled:cursor-wait disabled:bg-canvas"
          placeholder="Paste the complete job description here…"
          aria-describedby="job-description-help job-description-error"
          aria-invalid={Boolean(validationError)}
          required
        />
        <p id="job-description-help" className="mt-2 text-xs text-muted">
          Plain text only. Enter between 300 and 25,000 characters.
        </p>
        {validationError && (
          <p
            id="job-description-error"
            className="mt-2 text-sm font-medium text-danger"
          >
            {validationError}
          </p>
        )}
      </div>

      {extractionError && (
        <div role="alert" className="cc-alert-error mt-6">
          <p className="font-semibold">Analysis failed</p>
          <p className="mt-1 text-sm">{extractionError}</p>
          <p className="mt-2 text-xs">
            {retryingStoredOffer
              ? "Retry to analyze the stored original. Editing the text will start a new application."
              : "Review the description and try again."}
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isAnalyzing}
          className="cc-btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={Boolean(validationError) || isAnalyzing}
          className="cc-btn-primary disabled:bg-line disabled:text-muted disabled:opacity-100"
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
