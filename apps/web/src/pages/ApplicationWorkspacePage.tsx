import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { ApplicationCoverLetter } from "../components/ApplicationCoverLetter";
import { ApplicationExport } from "../components/ApplicationExport";
import { ApplicationJobAnalysis } from "../components/ApplicationJobAnalysis";
import { ApplicationOptimizedCv } from "../components/ApplicationOptimizedCv";
import { ApplicationOverview } from "../components/ApplicationOverview";
import { ApplicationProfileMatch } from "../components/ApplicationProfileMatch";
import { ApplicationWorkspace } from "../components/ApplicationWorkspace";
import type { WorkspaceSection } from "../components/WorkspaceNavigation";
import { ApiError } from "../services/api";
import { getApplication } from "../services/job-analysis";
import { compareProfile } from "../services/profile-comparison";
import type { PersistedApplication } from "../types/job-analysis";
import type { ProfileComparison } from "../types/profile-comparison";

export function ApplicationWorkspacePage() {
  const { applicationId } = useParams();
  const currentApplicationId = useRef(applicationId);
  currentApplicationId.current = applicationId;
  const [application, setApplication] = useState<PersistedApplication | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] =
    useState<WorkspaceSection>("overview");
  const [profileComparison, setProfileComparison] =
    useState<ProfileComparison | null>(null);
  const [profileComparisonError, setProfileComparisonError] = useState<
    string | null
  >(null);
  const [isComparingProfile, setIsComparingProfile] = useState(false);

  useEffect(() => {
    setApplication(null);
    setErrorMessage(null);
    setIsLoading(true);
    setActiveSection("overview");
    setProfileComparison(null);
    setProfileComparisonError(null);
    setIsComparingProfile(false);

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

  async function runProfileComparison() {
    if (!applicationId || isComparingProfile) return;

    setIsComparingProfile(true);
    setProfileComparisonError(null);
    try {
      const comparison = await compareProfile(applicationId);
      if (currentApplicationId.current === applicationId) {
        setProfileComparison(comparison);
      }
    } catch (error) {
      if (currentApplicationId.current === applicationId) {
        setProfileComparisonError(
          error instanceof ApiError
            ? error.message
            : "Unexpected error. Try again later.",
        );
      }
    } finally {
      if (currentApplicationId.current === applicationId) {
        setIsComparingProfile(false);
      }
    }
  }

  function changeSection(section: WorkspaceSection) {
    setActiveSection(section);
    if (
      section === "profile-match" &&
      !profileComparison &&
      !profileComparisonError
    ) {
      void runProfileComparison();
    }
  }

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
    <ApplicationWorkspace
      company={company}
      title={title}
      status={application.status}
      activeSection={activeSection}
      isJobAnalysisCompleted={application.jobAnalysis !== null}
      isProfileMatchCompleted={profileComparison !== null}
      onSectionChange={changeSection}
    >
      {activeSection === "overview" ? (
        <ApplicationOverview
          application={application}
          company={company}
          title={title}
        />
      ) : activeSection === "job-analysis" ? (
        <ApplicationJobAnalysis application={application} />
      ) : activeSection === "profile-match" ? (
        <ApplicationProfileMatch
          comparison={profileComparison}
          errorMessage={profileComparisonError}
          isLoading={isComparingProfile}
          onCompare={() => void runProfileComparison()}
          onReturnToJobAnalysis={() => setActiveSection("job-analysis")}
        />
      ) : activeSection === "optimized-cv" ? (
        <ApplicationOptimizedCv />
      ) : activeSection === "cover-letter" ? (
        <ApplicationCoverLetter />
      ) : activeSection === "export" ? (
        <ApplicationExport />
      ) : null}
    </ApplicationWorkspace>
  );
}
