import { useLocale } from "../hooks/useLocale";
import type { ProfileComparison } from "../types/profile-comparison";

interface ApplicationProfileMatchProps {
  comparison: ProfileComparison | null;
  errorMessage: string | null;
  isLoading: boolean;
  onCompare: () => void;
  onReturnToJobAnalysis: () => void;
}

function ComparisonList({
  title,
  values,
  tone = "default",
}: {
  title: string;
  values: string[];
  tone?: "match" | "gap" | "default";
}) {
  const { t } = useLocale();
  const bulletClass =
    tone === "match"
      ? "text-accent"
      : tone === "gap"
        ? "text-warning"
        : "text-brand";

  return (
    <section className="cc-card p-6">
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {values.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm leading-6 text-ink">
          {values.map((value) => (
            <li key={value} className="flex gap-2">
              <span aria-hidden="true" className={bulletClass}>
                •
              </span>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">
          {t("profileMatch.noneIdentified")}
        </p>
      )}
    </section>
  );
}

export function ApplicationProfileMatch({
  comparison,
  errorMessage,
  isLoading,
  onCompare,
  onReturnToJobAnalysis,
}: ApplicationProfileMatchProps) {
  const { t } = useLocale();

  if (isLoading) {
    return (
      <section className="cc-card p-8 text-center">
        <h2 className="text-lg font-bold text-ink">
          {t("profileMatch.title")}
        </h2>
        <p className="mt-2 text-sm text-muted">{t("profileMatch.loading")}</p>
      </section>
    );
  }

  if (!comparison) {
    return (
      <section className="cc-card p-8 text-center">
        <h2 className="text-lg font-bold text-ink">
          {t("profileMatch.title")}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {errorMessage ?? t("profileMatch.description")}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onReturnToJobAnalysis}
            className="cc-btn-secondary"
          >
            {t("profileMatch.returnToJobAnalysis")}
          </button>
          <button type="button" onClick={onCompare} className="cc-btn-primary">
            {errorMessage
              ? t("profileMatch.tryAgain")
              : t("profileMatch.compare")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="cc-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="cc-kicker">{t("profileMatch.title")}</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              {t("profileMatch.atsMatch")}
            </h2>
          </div>
          <p
            className="text-5xl font-bold tracking-tight text-accent"
            aria-label={t("profileMatch.scoreAria", {
              score: comparison.alignmentScore,
            })}
          >
            {comparison.alignmentScore}%
          </p>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <ComparisonList
          title={t("profileMatch.matchingSkills")}
          values={comparison.matchingSkills}
          tone="match"
        />
        <ComparisonList
          title={t("profileMatch.missingSkills")}
          values={comparison.missingSkills}
          tone="gap"
        />
        <ComparisonList
          title={t("profileMatch.strengths")}
          values={comparison.strengths}
          tone="match"
        />
        <ComparisonList
          title={t("profileMatch.weaknesses")}
          values={comparison.weaknesses}
          tone="gap"
        />
      </div>

      <section className="cc-card p-6">
        <h3 className="text-base font-bold text-ink">
          {t("profileMatch.recommendation")}
        </h3>
        <p className="mt-3 text-sm leading-6 text-ink">
          {comparison.recommendation}
        </p>
      </section>

      <button
        type="button"
        onClick={onReturnToJobAnalysis}
        className="cc-btn-secondary"
      >
        {t("profileMatch.returnToJobAnalysis")}
      </button>
    </div>
  );
}
