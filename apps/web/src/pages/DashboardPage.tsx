import { Link } from "react-router";
import { ApplicationCard } from "../components/ApplicationCard";
import { useApplications } from "../hooks/useApplications";
import type { Application } from "../types/application";

export function DashboardPage() {
  const { applications, deleteApplication } = useApplications();

  function handleDelete(application: Application) {
    const confirmed = window.confirm(
      `Delete the application for ${application.jobTitle} at ${application.companyName}?`,
    );

    if (confirmed) {
      deleteApplication(application.id);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">Applications</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Application dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Create and organize your job applications in one place.
          </p>
        </div>
        <Link
          to="/applications/new"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          New Application
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-bold text-slate-950">
            No applications yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
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
            />
          ))}
        </div>
      )}
    </section>
  );
}
