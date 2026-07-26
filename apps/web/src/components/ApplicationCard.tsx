import { Link } from "react-router";
import type { Application } from "../types/application";

interface ApplicationCardProps {
  application: Application;
  onDelete: (application: Application) => void;
}

export function ApplicationCard({
  application,
  onDelete,
}: ApplicationCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-700">
          {application.companyName}
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
          {application.jobTitle}
        </h2>
        {application.location && (
          <p className="mt-3 text-sm text-slate-600">{application.location}</p>
        )}
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
        <Link
          to={`/applications/${application.id}/edit`}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => onDelete(application)}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
