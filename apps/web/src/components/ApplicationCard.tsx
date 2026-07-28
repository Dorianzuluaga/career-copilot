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
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-700">{company}</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
          {title}
        </h2>
        {location && <p className="mt-3 text-sm text-slate-600">{location}</p>}
        <p className="mt-2 text-xs text-slate-500">
          Created {new Date(application.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Link
          to={`/applications/${application.id}`}
          className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Open
        </Link>
        <button
          type="button"
          onClick={() => void onDelete(application)}
          disabled={isDeleting}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </article>
  );
}
