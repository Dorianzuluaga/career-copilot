import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { ApplicationCoverLetter } from "../components/ApplicationCoverLetter";
import {
  ApplicationExport,
  createExportPreviewCache,
} from "../components/ApplicationExport";
import { ApplicationJobAnalysis } from "../components/ApplicationJobAnalysis";
import { ApplicationOptimizedCv } from "../components/ApplicationOptimizedCv";
import { ApplicationOverview } from "../components/ApplicationOverview";
import { ApplicationProfileMatch } from "../components/ApplicationProfileMatch";
import { ApplicationWorkspace } from "../components/ApplicationWorkspace";
import type { WorkspaceSection } from "../components/WorkspaceNavigation";
import { useUnsavedChangesGuard } from "../context/UnsavedChangesGuardProvider";
import { useLocale } from "../hooks/useLocale";
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
  getProfileMatchPresentation,
} from "../services/profile-comparison";
import {
  createProfileMatchPresentationCache,
  isCurrentProfileMatchPresentationScope,
  loadProfileMatchPresentation,
  profileMatchPresentationErrorMessage,
  readCachedProfileMatchPresentation,
} from "../services/profile-match-presentation";
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
  const { locale, t } = useLocale();
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
  const [hasSavedProfileMatch, setHasSavedProfileMatch] = useState(false);
  const [profileComparisonError, setProfileComparisonError] = useState<
    string | null
  >(null);
  const [presentationError, setPresentationError] = useState<string | null>(
    null,
  );
  const [isComparingProfile, setIsComparingProfile] = useState(false);
  const [isLoadingPresentation, setIsLoadingPresentation] = useState(false);
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
  const previewCacheRef = useRef(createExportPreviewCache());
  const presentationCacheRef = useRef(createProfileMatchPresentationCache());
  const presentationScopeRef = useRef<{
    applicationId: string;
    locale: typeof locale;
  } | null>(null);
  const presentationRequestRef = useRef(0);
  const loadedMatchApplicationIdRef = useRef<string | null>(null);
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const [presentationRetryKey, setPresentationRetryKey] = useState(0);

  const documentDescriptors: UnsavedDocumentDescriptor[] = [
    {
      id: OPTIMIZED_CV_DOCUMENT_ID,
      label: t("workspace.sections.optimizedCv"),
      section: "optimized-cv",
      working: optimizedCv,
      saved: savedOptimizedCv,
    },
    {
      id: COVER_LETTER_DOCUMENT_ID,
      label: t("workspace.sections.coverLetter"),
      section: "cover-letter",
      working: coverLetter,
      saved: savedCoverLetter,
    },
  ];

  useEffect(() => {
    previewCacheRef.current.clear();
    presentationCacheRef.current.clear();
    presentationScopeRef.current = null;
    presentationRequestRef.current += 1;
    loadedMatchApplicationIdRef.current = null;
    setApplication(null);
    setErrorMessage(null);
    setIsLoading(true);
    setActiveSection("overview");
    setProfileComparison(null);
    setHasSavedProfileMatch(false);
    setProfileComparisonError(null);
    setPresentationError(null);
    setIsComparingProfile(false);
    setIsLoadingPresentation(false);
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
          loadedMatchApplicationIdRef.current = applicationId;
          setHasSavedProfileMatch(savedProfileComparison !== null);
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
              : t("workspace.unexpectedError"),
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

  useEffect(() => {
    if (
      !applicationId ||
      !hasSavedProfileMatch ||
      loadedMatchApplicationIdRef.current !== applicationId
    ) {
      return;
    }

    const requestId = ++presentationRequestRef.current;
    const scope = { applicationId, locale };
    const previousScope = presentationScopeRef.current;
    const cached = readCachedProfileMatchPresentation(
      presentationCacheRef.current,
      previousScope,
      scope,
    );
    presentationScopeRef.current = scope;

    if (cached) {
      setProfileComparison(cached);
      setPresentationError(null);
      setIsLoadingPresentation(false);
      return;
    }

    let cancelled = false;
    setProfileComparison(null);
    setPresentationError(null);
    setIsLoadingPresentation(true);

    void loadProfileMatchPresentation({
      cache: presentationCacheRef.current,
      previousScope: scope,
      scope,
      fetchPresentation: getProfileMatchPresentation,
    })
      .then(({ presentation, scope: resultScope }) => {
        if (
          cancelled ||
          currentApplicationId.current !== applicationId ||
          requestId !== presentationRequestRef.current ||
          !isCurrentProfileMatchPresentationScope(resultScope, scope)
        ) {
          return;
        }

        if (!presentation) {
          setHasSavedProfileMatch(false);
          setProfileComparison(null);
          setPresentationError(null);
          setIsLoadingPresentation(false);
          return;
        }

        setProfileComparison(presentation);
        setPresentationError(null);
        setIsLoadingPresentation(false);
      })
      .catch(() => {
        if (
          cancelled ||
          currentApplicationId.current !== applicationId ||
          requestId !== presentationRequestRef.current
        ) {
          return;
        }
        setProfileComparison(null);
        setPresentationError(profileMatchPresentationErrorMessage(t));
        setIsLoadingPresentation(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applicationId, locale, hasSavedProfileMatch, presentationRetryKey, t]);

  async function runProfileComparison() {
    if (!applicationId || isComparingProfile) return;

    setIsComparingProfile(true);
    setProfileComparisonError(null);
    try {
      const comparison = await compareProfile(applicationId, locale);
      if (currentApplicationId.current === applicationId) {
        presentationCacheRef.current.set(applicationId, locale, comparison);
        setHasSavedProfileMatch(true);
        if (localeRef.current === locale) {
          setProfileComparison(comparison);
          setPresentationError(null);
          setIsLoadingPresentation(false);
        }
      }
    } catch (error) {
      if (currentApplicationId.current === applicationId) {
        setProfileComparisonError(
          error instanceof ApiError
            ? error.message
            : t("profileMatch.unexpectedError"),
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
      const result = await generateOptimizedCv(applicationId, locale);
      if (currentApplicationId.current === applicationId) {
        setOptimizedCv(result);
      }
    } catch (error) {
      if (currentApplicationId.current === applicationId) {
        setOptimizedCv(null);
        setOptimizedCvError(
          error instanceof ApiError
            ? error.message
            : t("optimizedCv.unexpectedError"),
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
        previewCacheRef.current.invalidateDocument(
          applicationId,
          OPTIMIZED_CV_DOCUMENT_ID,
        );
        setOptimizedCv(saved);
        setSavedOptimizedCv(saved);
        setOptimizedCvSavedMessage(t("optimizedCv.saved"));
      }
      return true;
    } catch (error) {
      if (currentApplicationId.current === applicationId) {
        setOptimizedCvSaveError(
          error instanceof ApiError
            ? error.message
            : t("optimizedCv.saveFailed"),
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
      const result = await generateCoverLetter(applicationId, locale);
      if (currentApplicationId.current === applicationId) {
        setCoverLetter(result);
      }
    } catch (error) {
      if (currentApplicationId.current === applicationId) {
        setCoverLetter(null);
        setCoverLetterError(
          error instanceof ApiError
            ? error.message === "Optimized CV not found."
              ? t("coverLetter.requiresOptimizedCv")
              : error.message
            : t("coverLetter.unexpectedError"),
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
        previewCacheRef.current.invalidateDocument(
          applicationId,
          COVER_LETTER_DOCUMENT_ID,
        );
        setCoverLetter(saved);
        setSavedCoverLetter(saved);
        setCoverLetterSavedMessage(t("coverLetter.saved"));
      }
      return true;
    } catch (error) {
      if (currentApplicationId.current === applicationId) {
        setCoverLetterSaveError(
          error instanceof ApiError
            ? error.message
            : t("coverLetter.saveFailed"),
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
        <p className="text-sm text-muted">{t("workspace.loading")}</p>
      </section>
    );
  }

  if (!application || errorMessage) {
    return (
      <section className="cc-card p-8 text-center">
        <h1 className="text-2xl font-bold">{t("workspace.notFoundTitle")}</h1>
        <p className="mt-2 text-muted">
          {errorMessage ?? t("workspace.notFoundDescription")}
        </p>
        <Link to="/dashboard" className="cc-btn-primary mt-6">
          {t("workspace.returnToDashboard")}
        </Link>
      </section>
    );
  }

  const title =
    application.jobAnalysis?.title ??
    application.jobOffer?.title ??
    t("dashboard.untitledOpportunity");
  const company =
    application.jobAnalysis?.company ??
    application.jobOffer?.company ??
    t("dashboard.companyUnknown");
  const hasSavedOptimizedCv = savedOptimizedCv !== null;
  const hasSavedCoverLetter = savedCoverLetter !== null;

  return (
    <ApplicationWorkspace
      company={company}
      title={title}
      status={application.status}
      activeSection={activeSection}
      isJobAnalysisCompleted={application.jobAnalysis !== null}
      isProfileMatchCompleted={hasSavedProfileMatch}
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
          hasSavedMatch={hasSavedProfileMatch}
          isLoading={isComparingProfile}
          isLoadingPresentation={isLoadingPresentation}
          onCompare={() => void runProfileComparison()}
          onRetryPresentation={() =>
            setPresentationRetryKey((current) => current + 1)
          }
          onReturnToJobAnalysis={() => changeSection("job-analysis")}
          presentationError={presentationError}
        />
      ) : activeSection === "optimized-cv" ? (
        <ApplicationOptimizedCv
          applicationId={application.id}
          errorMessage={optimizedCvError}
          isLoading={isGeneratingOptimizedCv}
          isSaving={isSavingOptimizedCv}
          onChange={handleOptimizedCvChange}
          onContinueToCoverLetter={
            hasSavedOptimizedCv
              ? () => changeSection("cover-letter")
              : undefined
          }
          onExportCv={
            hasSavedOptimizedCv ? () => changeSection("export") : undefined
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
          previewCache={previewCacheRef.current}
        />
      ) : null}
    </ApplicationWorkspace>
  );
}
