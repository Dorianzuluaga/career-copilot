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
import { useUnsavedChangesGuard } from "../context/UnsavedChangesGuardProvider";
import { useUnsavedChangesRegistration } from "../hooks/useUnsavedChangesRegistration";
import {
  getDocumentsBlockingSectionLeave,
  getDocumentsBlockingWorkspaceExit,
  type UnsavedDocument,
  type UnsavedDocumentDescriptor,
} from "../lib/unsaved-documents";
import { ApiError } from "../services/api";
import { getApplication } from "../services/job-analysis";
import { getMasterCv } from "../services/master-cv";
import {
  generateCoverLetter,
  getCoverLetter,
  saveCoverLetter,
} from "../services/cover-letter";
import {
  generateOptimizedCv,
  getOptimizedCv,
  saveOptimizedCv,
} from "../services/optimized-cv";
import {
  compareProfile,
  getProfileComparison,
} from "../services/profile-comparison";
import type { CoverLetter } from "../types/cover-letter";
import type { PersistedApplication } from "../types/job-analysis";
import type { PersonalProjectItem } from "../types/master-cv";
import type { OptimizedCv } from "../types/optimized-cv";
import type { ProfileComparison } from "../types/profile-comparison";

const OPTIMIZED_CV_DOCUMENT_ID = "optimized-cv";
const COVER_LETTER_DOCUMENT_ID = "cover-letter";

export function ApplicationWorkspacePage() {
  const { applicationId } = useParams();
  const currentApplicationId = useRef(applicationId);
  currentApplicationId.current = applicationId;
  const { requestNavigation } = useUnsavedChangesGuard();
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
  const [optimizedCv, setOptimizedCv] = useState<OptimizedCv | null>(null);
  const [savedOptimizedCv, setSavedOptimizedCv] = useState<OptimizedCv | null>(
    null,
  );
  const [optimizedCvError, setOptimizedCvError] = useState<string | null>(null);
  const [isGeneratingOptimizedCv, setIsGeneratingOptimizedCv] = useState(false);
  const [isSavingOptimizedCv, setIsSavingOptimizedCv] = useState(false);
  const [optimizedCvSaveError, setOptimizedCvSaveError] = useState<
    string | null
  >(null);
  const [optimizedCvSavedMessage, setOptimizedCvSavedMessage] = useState<
    string | null
  >(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [savedCoverLetter, setSavedCoverLetter] = useState<CoverLetter | null>(
    null,
  );
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isSavingCoverLetter, setIsSavingCoverLetter] = useState(false);
  const [coverLetterSaveError, setCoverLetterSaveError] = useState<
    string | null
  >(null);
  const [coverLetterSavedMessage, setCoverLetterSavedMessage] = useState<
    string | null
  >(null);
  const [masterCvPersonalProjects, setMasterCvPersonalProjects] = useState<
    PersonalProjectItem[]
  >([]);

  const documentDescriptors: UnsavedDocumentDescriptor[] = [
    {
      id: OPTIMIZED_CV_DOCUMENT_ID,
      label: "Optimized CV",
      section: "optimized-cv",
      working: optimizedCv,
      saved: savedOptimizedCv,
    },
    {
      id: COVER_LETTER_DOCUMENT_ID,
      label: "Cover Letter",
      section: "cover-letter",
      working: coverLetter,
      saved: savedCoverLetter,
    },
  ];

  useEffect(() => {
    setApplication(null);
    setErrorMessage(null);
    setIsLoading(true);
    setActiveSection("overview");
    setProfileComparison(null);
    setProfileComparisonError(null);
    setIsComparingProfile(false);
    setOptimizedCv(null);
    setSavedOptimizedCv(null);
    setOptimizedCvError(null);
    setIsGeneratingOptimizedCv(false);
    setIsSavingOptimizedCv(false);
    setOptimizedCvSaveError(null);
    setOptimizedCvSavedMessage(null);
    setCoverLetter(null);
    setSavedCoverLetter(null);
    setCoverLetterError(null);
    setIsGeneratingCoverLetter(false);
    setIsSavingCoverLetter(false);
    setCoverLetterSaveError(null);
    setCoverLetterSavedMessage(null);
    setMasterCvPersonalProjects([]);

    if (!applicationId) {
      setErrorMessage("Application not found.");
      setIsLoading(false);
      return;
    }

    let isActive = true;
    void Promise.all([
      getApplication(applicationId),
      getProfileComparison(applicationId),
      getOptimizedCv(applicationId),
      getCoverLetter(applicationId),
      getMasterCv(),
    ])
      .then(
        ([
          result,
          savedProfileComparison,
          savedOptimizedCv,
          savedCoverLetter,
          masterCv,
        ]) => {
          if (!isActive) return;
          setApplication(result);
          setProfileComparison(savedProfileComparison);
          setOptimizedCv(savedOptimizedCv);
          setSavedOptimizedCv(savedOptimizedCv);
          setCoverLetter(savedCoverLetter);
          setSavedCoverLetter(savedCoverLetter);
          setMasterCvPersonalProjects(masterCv?.personalProjects ?? []);
        },
      )
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

  async function runOptimizedCvGeneration() {
    if (!applicationId || isGeneratingOptimizedCv) return;

    setIsGeneratingOptimizedCv(true);
    setOptimizedCvError(null);
    setOptimizedCvSaveError(null);
    setOptimizedCvSavedMessage(null);
    try {
      const result = await generateOptimizedCv(applicationId);
      if (currentApplicationId.current === applicationId) {
        setOptimizedCv(result);
      }
    } catch (error) {
      if (currentApplicationId.current === applicationId) {
        setOptimizedCv(null);
        setOptimizedCvError(
          error instanceof ApiError
            ? error.message
            : "Unexpected error. Try again later.",
        );
      }
    } finally {
      if (currentApplicationId.current === applicationId) {
        setIsGeneratingOptimizedCv(false);
      }
    }
  }

  async function runOptimizedCvSave(): Promise<boolean> {
    if (!applicationId || !optimizedCv || isSavingOptimizedCv) return false;

    setIsSavingOptimizedCv(true);
    setOptimizedCvSaveError(null);
    setOptimizedCvSavedMessage(null);
    try {
      const saved = await saveOptimizedCv(applicationId, optimizedCv);
      if (currentApplicationId.current === applicationId) {
        setOptimizedCv(saved);
        setSavedOptimizedCv(saved);
        setOptimizedCvSavedMessage("Optimized CV saved.");
      }
      return true;
    } catch (error) {
      if (currentApplicationId.current === applicationId) {
        setOptimizedCvSaveError(
          error instanceof ApiError
            ? error.message
            : "Unable to save this Optimized CV.",
        );
      }
      return false;
    } finally {
      if (currentApplicationId.current === applicationId) {
        setIsSavingOptimizedCv(false);
      }
    }
  }

  async function runCoverLetterGeneration() {
    if (!applicationId || isGeneratingCoverLetter) return;

    setIsGeneratingCoverLetter(true);
    setCoverLetterError(null);
    setCoverLetterSaveError(null);
    setCoverLetterSavedMessage(null);
    try {
      const result = await generateCoverLetter(applicationId);
      if (currentApplicationId.current === applicationId) {
        setCoverLetter(result);
      }
    } catch (error) {
      if (currentApplicationId.current === applicationId) {
        setCoverLetter(null);
        setCoverLetterError(
          error instanceof ApiError
            ? error.message === "Optimized CV not found."
              ? "Save an Optimized CV before generating a Cover Letter."
              : error.message
            : "Unexpected error. Try again later.",
        );
      }
    } finally {
      if (currentApplicationId.current === applicationId) {
        setIsGeneratingCoverLetter(false);
      }
    }
  }

  async function runCoverLetterSave(): Promise<boolean> {
    if (!applicationId || !coverLetter || isSavingCoverLetter) return false;

    setIsSavingCoverLetter(true);
    setCoverLetterSaveError(null);
    setCoverLetterSavedMessage(null);
    try {
      const saved = await saveCoverLetter(applicationId, coverLetter);
      if (currentApplicationId.current === applicationId) {
        setCoverLetter(saved);
        setSavedCoverLetter(saved);
        setCoverLetterSavedMessage("Cover Letter saved.");
      }
      return true;
    } catch (error) {
      if (currentApplicationId.current === applicationId) {
        setCoverLetterSaveError(
          error instanceof ApiError
            ? error.message
            : "Unable to save this Cover Letter.",
        );
      }
      return false;
    } finally {
      if (currentApplicationId.current === applicationId) {
        setIsSavingCoverLetter(false);
      }
    }
  }

  function handleOptimizedCvChange(next: OptimizedCv) {
    setOptimizedCv(next);
    setOptimizedCvSavedMessage(null);
    setOptimizedCvSaveError(null);
  }

  function handleCoverLetterChange(next: CoverLetter) {
    setCoverLetter(next);
    setCoverLetterSavedMessage(null);
    setCoverLetterSaveError(null);
  }

  function discardDocuments(documents: UnsavedDocument[]) {
    for (const document of documents) {
      if (document.id === OPTIMIZED_CV_DOCUMENT_ID) {
        setOptimizedCv(savedOptimizedCv);
        setOptimizedCvSavedMessage(null);
        setOptimizedCvSaveError(null);
      }
      if (document.id === COVER_LETTER_DOCUMENT_ID) {
        setCoverLetter(savedCoverLetter);
        setCoverLetterSavedMessage(null);
        setCoverLetterSaveError(null);
      }
    }
  }

  async function saveDocuments(documents: UnsavedDocument[]): Promise<boolean> {
    for (const document of documents) {
      if (document.id === OPTIMIZED_CV_DOCUMENT_ID) {
        const saved = await runOptimizedCvSave();
        if (!saved) return false;
      }
      if (document.id === COVER_LETTER_DOCUMENT_ID) {
        const saved = await runCoverLetterSave();
        if (!saved) return false;
      }
    }
    return true;
  }

  useUnsavedChangesRegistration({
    getBlockingDocuments: () =>
      getDocumentsBlockingWorkspaceExit(documentDescriptors),
    saveDocuments,
    discardDocuments,
  });

  function changeSection(section: WorkspaceSection) {
    if (section === activeSection) return;
    const blockingDocuments = getDocumentsBlockingSectionLeave(
      activeSection,
      documentDescriptors,
    );
    requestNavigation(() => setActiveSection(section), blockingDocuments);
  }

  if (isLoading) {
    return (
      <section className="cc-card p-8 text-center">
        <p className="text-sm text-muted">Loading application workspace…</p>
      </section>
    );
  }

  if (!application || errorMessage) {
    return (
      <section className="cc-card p-8 text-center">
        <h1 className="text-2xl font-bold">Application not found</h1>
        <p className="mt-2 text-muted">
          {errorMessage ?? "This application is not available."}
        </p>
        <Link to="/dashboard" className="cc-btn-primary mt-6">
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
  const hasSavedOptimizedCv = savedOptimizedCv !== null;
  const hasSavedCoverLetter = savedCoverLetter !== null;

  return (
    <ApplicationWorkspace
      company={company}
      title={title}
      status={application.status}
      activeSection={activeSection}
      isJobAnalysisCompleted={application.jobAnalysis !== null}
      isProfileMatchCompleted={profileComparison !== null}
      isOptimizedCvCompleted={hasSavedOptimizedCv}
      isCoverLetterCompleted={hasSavedCoverLetter}
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
          onReturnToJobAnalysis={() => changeSection("job-analysis")}
        />
      ) : activeSection === "optimized-cv" ? (
        <ApplicationOptimizedCv
          errorMessage={optimizedCvError}
          isLoading={isGeneratingOptimizedCv}
          isSaving={isSavingOptimizedCv}
          onChange={handleOptimizedCvChange}
          onContinueToCoverLetter={
            hasSavedOptimizedCv
              ? () => changeSection("cover-letter")
              : undefined
          }
          onGenerate={() => void runOptimizedCvGeneration()}
          onSave={() => void runOptimizedCvSave()}
          masterCvPersonalProjects={masterCvPersonalProjects}
          optimizedCv={optimizedCv}
          saveErrorMessage={optimizedCvSaveError}
          savedMessage={optimizedCvSavedMessage}
        />
      ) : activeSection === "cover-letter" ? (
        <ApplicationCoverLetter
          coverLetter={coverLetter}
          errorMessage={coverLetterError}
          isLoading={isGeneratingCoverLetter}
          isSaving={isSavingCoverLetter}
          onChange={handleCoverLetterChange}
          onContinueToExport={
            hasSavedCoverLetter ? () => changeSection("export") : undefined
          }
          onGenerate={() => void runCoverLetterGeneration()}
          onSave={() => void runCoverLetterSave()}
          saveErrorMessage={coverLetterSaveError}
          savedMessage={coverLetterSavedMessage}
        />
      ) : activeSection === "export" ? (
        <ApplicationExport
          applicationId={application.id}
          coverLetter={savedCoverLetter}
          optimizedCv={savedOptimizedCv}
        />
      ) : null}
    </ApplicationWorkspace>
  );
}
