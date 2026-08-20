import { useLocale } from "../hooks/useLocale";
import type { PersistedApplication } from "../types/job-analysis";

interface ApplicationOverviewProps {
  application: PersistedApplication;
  company: string;
  title: string;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function ApplicationOverview({
  application,
  company,
  title,
}: ApplicationOverviewProps) {
  const { t } = useLocale();

  return (
    <section
      aria-labelledby="workspace-overview-title"
      className="cc-card p-6 sm:p-8"
    >
      <div>
        <p className="cc-kicker">{t("workspace.kicker")}</p>
        <h2
          id="workspace-overview-title"
          className="mt-1 text-2xl font-bold text-ink"
        >
          {t("workspace.sections.overview")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {t("workspace.overviewDescription")}
        </p>
      </div>

      <dl className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
        <Detail label={t("workspace.company")} value={company} />
        <Detail label={t("workspace.jobTitle")} value={title} />
        <Detail label={t("workspace.status")} value={application.status} />
        <Detail
          label={t("workspace.created")}
          value={new Date(application.createdAt).toLocaleDateString()}
        />
        <Detail
          label={t("workspace.lastUpdated")}
          value={new Date(application.updatedAt).toLocaleDateString()}
        />
      </dl>
    </section>
  );
}
