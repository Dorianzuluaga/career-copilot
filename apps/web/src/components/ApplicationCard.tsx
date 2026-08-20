import { Link } from "react-router";
import { useLocale } from "../hooks/useLocale";
import type { PersistedApplication } from "../types/job-analysis";

interface ApplicationCardProps {
  application: PersistedApplication;
  isDeleting: boolean;
  onDelete: (application: PersistedApplication) => Promise<void>;
}

export function ApplicationCard({
  application,
  isDeleting,
  onDelete,
}: ApplicationCardProps) {
  const { locale, t } = useLocale();
  const company =
    application.jobAnalysis?.company ??
    application.jobOffer?.company ??
    t("dashboard.companyUnknown");
  const title =
    application.jobAnalysis?.title ??
    application.jobOffer?.title ??
    t("dashboard.untitledOpportunity");
  const location = application.jobAnalysis?.location;

  return (
    <article className="cc-card flex h-full flex-col p-5">
      <div className="flex-1">
        <p className="cc-kicker">{company}</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        {location && <p className="mt-3 text-sm text-muted">{location}</p>}
        <p className="mt-2 text-xs text-muted">
          {t("dashboard.created", {
            date: new Date(application.createdAt).toLocaleDateString(locale),
          })}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
        <Link to={`/applications/${application.id}`} className="cc-btn-primary">
          {t("dashboard.open")}
        </Link>
        <button
          type="button"
          onClick={() => void onDelete(application)}
          disabled={isDeleting}
          className="cc-btn-ghost-danger"
        >
          {isDeleting ? t("dashboard.deleting") : t("dashboard.delete")}
        </button>
      </div>
    </article>
  );
}
