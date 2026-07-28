import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ApiError } from "../services/api";
import { getApplication } from "../services/job-analysis";
import type { JobAnalysis, PersistedApplication } from "../types/job-analysis";

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function AnalysisList({ title, values }: { title: string; values: string[] }) {
  return (
    <section>
      <h3 className="text-sm font-bold text-slate-950">{title}</h3>
      {values.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
          {values.map((value) => (
            <li key={value} className="flex gap-2">
              <span aria-hidden="true" className="text-blue-600">
                •
              </span>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Not identified</p>
      )}
    </section>
  );
}

function StructuredAnalysis({ analysis }: { analysis: JobAnalysis }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-950">Job analysis</h2>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          Version {analysis.analysisVersion}
        </span>
      </div>

      <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Employment type" value={analysis.employmentType} />
        <Detail label="Location" value={analysis.location} />
        <Detail label="Experience level" value={analysis.experienceLevel} />
        <Detail label="Education" value={analysis.education} />
        <Detail
          label="Languages"
          value={
            analysis.languages.length > 0 ? analysis.languages.join(", ") : null
          }
        />
      </dl>

      <div className="mt-6 border-t border-slate-100 pt-6">
        <h3 className="text-sm font-bold text-slate-950">Summary</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {analysis.summary || "Not identified"}
        </p>
      </div>

      <div className="mt-6 grid gap-8 border-t border-slate-100 pt-6 md:grid-cols-3">
        <AnalysisList
          title="Required skills"
          values={analysis.requiredSkills}
        />
        <AnalysisList
          title="Responsibilities"
          values={analysis.responsibilities}
        />
        <AnalysisList title="ATS keywords" values={analysis.atsKeywords} />
      </div>
    </section>
  );
}

export function ApplicationWorkspacePage() {
  const { applicationId } = useParams();
  const [application, setApplication] = useState<PersistedApplication | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) {
      setErrorMessage("Application not found.");
      setIsLoading(false);
      return;
    }

    let isActive = true;
    void getApplication(applicationId)
      .then((result) => {
        if (isActive) setApplication(result);
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : "Unexpected error. Try again later.",
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [applicationId]);

  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-600">Loading application workspace…</p>
      </section>
    );
  }

  if (!application || errorMessage) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Application not found</h1>
        <p className="mt-2 text-slate-600">
          {errorMessage ?? "This application is not available."}
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Return to dashboard
        </Link>
      </section>
    );
  }

  const title =
    application.jobAnalysis?.title ??
    application.jobOffer?.title ??
    "Untitled opportunity";
  const company =
    application.jobAnalysis?.company ??
    application.jobOffer?.company ??
    "Company not identified";

  return (
    <div>
      <div>
        <div>
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            ← Dashboard
          </Link>
          <p className="mt-6 text-sm font-semibold text-blue-700">{company}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Application information
          </h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <Detail label="Company" value={company} />
            <Detail label="Job title" value={title} />
            <Detail label="Status" value={application.status} />
            <Detail
              label="Created"
              value={new Date(application.createdAt).toLocaleDateString()}
            />
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Original job description
              </dt>
              <dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-900">
                {application.jobOffer?.originalDescription ?? "Not available"}
              </dd>
            </div>
          </dl>
        </section>

        {application.jobAnalysis && (
          <StructuredAnalysis analysis={application.jobAnalysis} />
        )}
      </div>
    </div>
  );
}
