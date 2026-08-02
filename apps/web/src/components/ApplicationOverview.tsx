import type { PersistedApplication } from "../types/job-analysis";

interface ApplicationOverviewProps {
  application: PersistedApplication;
  company: string;
  title: string;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export function ApplicationOverview({
  application,
  company,
  title,
}: ApplicationOverviewProps) {
  return (
    <section
      aria-labelledby="workspace-overview-title"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <p className="text-sm font-semibold text-blue-700">
          Application workspace
        </p>
        <h2
          id="workspace-overview-title"
          className="mt-1 text-2xl font-bold text-slate-950"
        >
          Overview
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Review the current application details before continuing your work.
        </p>
      </div>

      <dl className="mt-8 grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
        <Detail label="Company" value={company} />
        <Detail label="Job title" value={title} />
        <Detail label="Status" value={application.status} />
        <Detail
          label="Created"
          value={new Date(application.createdAt).toLocaleDateString()}
        />
        <Detail
          label="Last updated"
          value={new Date(application.updatedAt).toLocaleDateString()}
        />
      </dl>
    </section>
  );
}
