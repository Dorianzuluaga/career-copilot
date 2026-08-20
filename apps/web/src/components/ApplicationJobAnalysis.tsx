import { useLocale } from "../hooks/useLocale";
import type { JobAnalysis, PersistedApplication } from "../types/job-analysis";

interface ApplicationJobAnalysisProps {
  application: PersistedApplication;
}

function Detail({ label, value }: { label: string; value: string | null }) {
  const { t } = useLocale();

  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink">
        {value || t("jobAnalysis.result.notProvided")}
      </dd>
    </div>
  );
}

function AnalysisList({ title, values }: { title: string; values: string[] }) {
  const { t } = useLocale();

  return (
    <section>
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      {values.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-ink">
          {values.map((value) => (
            <li key={value} className="flex gap-2">
              <span aria-hidden="true" className="text-brand">
                •
              </span>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">
          {t("jobAnalysis.result.notIdentified")}
        </p>
      )}
    </section>
  );
}

function StructuredAnalysis({ analysis }: { analysis: JobAnalysis }) {
  const { t } = useLocale();

  return (
    <section className="cc-card p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-ink">
          {t("jobAnalysis.result.title")}
        </h2>
        <span className="cc-badge-brand">
          {t("jobAnalysis.result.version", {
            version: analysis.analysisVersion,
          })}
        </span>
      </div>

      <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Detail
          label={t("jobAnalysis.result.employmentType")}
          value={analysis.employmentType}
        />
        <Detail
          label={t("jobAnalysis.result.location")}
          value={analysis.location}
        />
        <Detail
          label={t("jobAnalysis.result.experienceLevel")}
          value={analysis.experienceLevel}
        />
        <Detail
          label={t("jobAnalysis.result.education")}
          value={analysis.education}
        />
        <Detail
          label={t("jobAnalysis.result.languages")}
          value={
            analysis.languages.length > 0 ? analysis.languages.join(", ") : null
          }
        />
      </dl>

      <div className="mt-6 border-t border-line pt-6">
        <h3 className="text-sm font-bold text-ink">
          {t("jobAnalysis.result.summary")}
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink">
          {analysis.summary || t("jobAnalysis.result.notIdentified")}
        </p>
      </div>

      <div className="mt-6 grid gap-8 border-t border-line pt-6 md:grid-cols-3">
        <AnalysisList
          title={t("jobAnalysis.result.requiredSkills")}
          values={analysis.requiredSkills}
        />
        <AnalysisList
          title={t("jobAnalysis.result.responsibilities")}
          values={analysis.responsibilities}
        />
        <AnalysisList
          title={t("jobAnalysis.result.atsKeywords")}
          values={analysis.atsKeywords}
        />
      </div>
    </section>
  );
}

export function ApplicationJobAnalysis({
  application,
}: ApplicationJobAnalysisProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <section className="cc-card p-6">
        <h2 className="text-lg font-bold text-ink">
          {t("jobAnalysis.result.originalTitle")}
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">
          {application.jobOffer?.originalDescription ??
            t("jobAnalysis.result.notAvailable")}
        </p>
      </section>

      {application.jobAnalysis && (
        <StructuredAnalysis analysis={application.jobAnalysis} />
      )}
    </div>
  );
}
