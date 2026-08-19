import { Link } from "react-router";
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
  const company =
    application.jobAnalysis?.company ??
    application.jobOffer?.company ??
    "Company not identified";
  const title =
    application.jobAnalysis?.title ??
    application.jobOffer?.title ??
    "Untitled opportunity";
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
          Created {new Date(application.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
        <Link to={`/applications/${application.id}`} className="cc-btn-primary">
          Open
        </Link>
        <button
          type="button"
          onClick={() => void onDelete(application)}
          disabled={isDeleting}
          className="cc-btn-ghost-danger"
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </article>
  );
}
