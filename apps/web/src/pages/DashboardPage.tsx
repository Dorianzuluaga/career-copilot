import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { ApplicationCard } from "../components/ApplicationCard";
import { ApiError } from "../services/api";
import { deleteApplication, listApplications } from "../services/job-analysis";
import type { PersistedApplication } from "../types/job-analysis";

export function DashboardPage() {
  const [applications, setApplications] = useState<PersistedApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setApplications(await listApplications());
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unexpected error. Try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  async function handleDelete(application: PersistedApplication) {
    const jobTitle =
      application.jobAnalysis?.title ??
      application.jobOffer?.title ??
      "this opportunity";
    const company =
      application.jobAnalysis?.company ??
      application.jobOffer?.company ??
      "the company";
    const confirmed = window.confirm(
      `Delete the application for ${jobTitle} at ${company}?`,
    );

    if (!confirmed) return;

    setDeletingId(application.id);
    setErrorMessage(null);
    try {
      await deleteApplication(application.id);
      setApplications((currentApplications) =>
        currentApplications.filter((item) => item.id !== application.id),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unexpected error. Try again later.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Application dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Create and organize your job applications in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/master-cv" className="cc-btn-secondary w-fit">
            Edit Master CV
          </Link>
          <Link to="/applications/new" className="cc-btn-primary w-fit">
            New Application
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="cc-alert-error mt-8 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{errorMessage}</p>
          <button
            type="button"
            onClick={() => void loadApplications()}
            className="cc-btn-danger w-fit px-3 py-2"
          >
            Try again
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="cc-card mt-10 px-6 py-14 text-center">
          <p className="text-sm text-muted">Loading applications…</p>
        </div>
      ) : applications.length === 0 && !errorMessage ? (
        <div className="mt-10 rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
          <h2 className="text-lg font-bold text-ink">No applications yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Create your first application to start organizing your job search.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onDelete={handleDelete}
              isDeleting={deletingId === application.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
