import { Link, useNavigate, useParams } from "react-router";
import { ApplicationForm } from "../components/ApplicationForm";
import { useApplications } from "../hooks/useApplications";
import type { ApplicationInput } from "../types/application";

export function ApplicationFormPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { createApplication, getApplication, updateApplication } =
    useApplications();
  const application = applicationId ? getApplication(applicationId) : undefined;
  const isEditing = Boolean(applicationId);

  function handleSubmit(input: ApplicationInput) {
    if (applicationId) {
      updateApplication(applicationId, input);
    } else {
      createApplication(input);
    }

    navigate("/");
  }

  if (isEditing && !application) {
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
    <section className="mx-auto max-w-2xl">
      <p className="text-sm font-semibold text-blue-700">Application details</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">
        {isEditing ? "Edit application" : "Create application"}
      </h1>
      <p className="mt-2 text-slate-600">
        {isEditing
          ? "Update the information for this application."
          : "Add the opportunity you want to track."}
      </p>

      <div className="mt-8">
        <ApplicationForm
          initialValues={application}
          submitLabel="Save"
          onSubmit={handleSubmit}
          onCancel={() => navigate("/")}
        />
      </div>
    </section>
  );
}
