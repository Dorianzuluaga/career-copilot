import type { FormEvent } from "react";
import { useLocale } from "../hooks/useLocale";
import type { TranslationKey } from "../i18n/messages";

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

export function jobDescriptionError(
  description: string,
): TranslationKey | null {
  if (description.trim() === "") return "jobAnalysis.validation.required";
  if (description.length < MIN_DESCRIPTION_LENGTH) {
    return "jobAnalysis.validation.tooShort";
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return "jobAnalysis.validation.tooLong";
  }
  if (hasUnsupportedControlCharacters(description)) {
    return "jobAnalysis.validation.plainText";
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
  const { locale, t } = useLocale();
  const validationErrorKey = jobDescriptionError(description);
  const validationError = validationErrorKey ? t(validationErrorKey) : null;

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
            {t("jobAnalysis.form.label")}
          </label>
          <span
            className={`text-xs ${
              description.length > MAX_DESCRIPTION_LENGTH
                ? "font-semibold text-danger"
                : "text-muted"
            }`}
          >
            {description.length.toLocaleString(locale)} /{" "}
            {MAX_DESCRIPTION_LENGTH.toLocaleString(locale)}
          </span>
        </div>
        <textarea
          id="jobDescription"
          name="jobDescription"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={isAnalyzing}
          className="cc-field mt-2 min-h-80 resize-y px-3 py-3 disabled:cursor-wait disabled:bg-canvas"
          placeholder={t("jobAnalysis.form.placeholder")}
          aria-describedby="job-description-help job-description-error"
          aria-invalid={Boolean(validationError)}
          required
        />
        <p id="job-description-help" className="mt-2 text-xs text-muted">
          {t("jobAnalysis.form.help")}
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
          <p className="font-semibold">
            {t("jobAnalysis.form.analysisFailed")}
          </p>
          <p className="mt-1 text-sm">{extractionError}</p>
          <p className="mt-2 text-xs">
            {retryingStoredOffer
              ? t("jobAnalysis.form.retryStoredHint")
              : t("jobAnalysis.form.reviewHint")}
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
          {t("jobAnalysis.form.cancel")}
        </button>
        <button
          type="submit"
          disabled={Boolean(validationError) || isAnalyzing}
          className="cc-btn-primary disabled:bg-line disabled:text-muted disabled:opacity-100"
        >
          {isAnalyzing
            ? t("jobAnalysis.form.analyzing")
            : retryingStoredOffer
              ? t("jobAnalysis.form.retry")
              : t("jobAnalysis.form.analyze")}
        </button>
      </div>
    </form>
  );
}
