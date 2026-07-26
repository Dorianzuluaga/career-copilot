import { Link, useParams } from "react-router";
import { ComingSoonSection } from "../components/ComingSoonSection";
import { useApplications } from "../hooks/useApplications";

export function ApplicationWorkspacePage() {
  const { applicationId } = useParams();
  const { getApplication } = useApplications();
  const application = applicationId ? getApplication(applicationId) : undefined;

  if (!application) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Application not found</h1>
        <p className="mt-2 text-slate-600">
          This application is not available in the current session.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Return to dashboard
        </Link>
      </section>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/"
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            ← Dashboard
          </Link>
          <p className="mt-6 text-sm font-semibold text-blue-700">
            {application.companyName}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            {application.jobTitle}
          </h1>
        </div>
        <Link
          to={`/applications/${application.id}/edit`}
          className="inline-flex w-fit rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Edit application
        </Link>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-lg font-bold text-slate-950">
            Application information
          </h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Company name
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {application.companyName}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Job title
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {application.jobTitle}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {application.location || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Job URL
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {application.jobUrl ? (
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-blue-700 hover:underline"
                  >
                    {application.jobUrl}
                  </a>
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Created
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {new Date(application.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Job Description
              </dt>
              <dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-900">
                {application.jobDescription}
              </dd>
            </div>
          </dl>
        </section>

        <div className="lg:col-span-3 grid gap-6 md:grid-cols-2">
          <ComingSoonSection title="AI Analysis" />
          <ComingSoonSection title="Generated Documents" />
        </div>
      </div>
    </div>
  );
}
