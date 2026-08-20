import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { MasterCvForm } from "../components/MasterCvForm";
import { useLocale } from "../hooks/useLocale";
import {
  ApiError,
  createMasterCv,
  getMasterCv,
  masterCvInputFromExtraction,
  uploadMasterCv,
} from "../services/master-cv";
import type { MasterCvInput } from "../types/master-cv";

const emptyMasterCv = (): MasterCvInput => ({
  fullName: "",
  email: "",
  phone: null,
  location: null,
  linkedin: null,
  portfolio: null,
  professionalSummary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  personalProjects: [],
});

type Step = "choice" | "upload" | "form";

export function MasterCvOnboardingPage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("choice");
  const [isChecking, setIsChecking] = useState(true);
  const [existingMasterCv, setExistingMasterCv] = useState(false);
  const [initialValue, setInitialValue] = useState(emptyMasterCv);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    void getMasterCv()
      .then((masterCv) => {
        if (isActive && masterCv) setExistingMasterCv(true);
      })
      .finally(() => {
        if (isActive) setIsChecking(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  async function handleUpload() {
    if (!selectedFile) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      const extraction = await uploadMasterCv(selectedFile);
      setInitialValue(masterCvInputFromExtraction(extraction));
      setStep("form");
    } catch (error) {
      setUploadError(
        error instanceof ApiError
          ? error.message
          : t("masterCv.onboarding.extractFailed"),
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave(input: MasterCvInput) {
    setSaveError(null);
    setIsSaving(true);
    try {
      await createMasterCv(input);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setSaveError(
        error instanceof ApiError
          ? error.message
          : t("masterCv.onboarding.saveFailed"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  function continueManually() {
    setInitialValue(emptyMasterCv());
    setUploadError(null);
    setStep("form");
  }

  if (isChecking) {
    return (
      <p className="text-sm text-muted">{t("masterCv.onboarding.loading")}</p>
    );
  }
  if (existingMasterCv) return <Navigate to="/master-cv" replace />;

  if (step === "choice") {
    return (
      <section className="mx-auto max-w-3xl">
        <p className="cc-kicker">{t("masterCv.kicker")}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {t("masterCv.onboarding.title")}
        </h1>
        <p className="mt-3 text-muted">
          {t("masterCv.onboarding.description")}
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setStep("upload")}
            className="cc-card p-6 text-left transition hover:border-brand"
          >
            <span className="text-lg font-bold">
              {t("masterCv.onboarding.uploadTitle")}
            </span>
            <span className="mt-2 block text-sm text-muted">
              {t("masterCv.onboarding.uploadDescription")}
            </span>
          </button>
          <button
            type="button"
            onClick={continueManually}
            className="cc-card p-6 text-left transition hover:border-brand"
          >
            <span className="text-lg font-bold">
              {t("masterCv.onboarding.manualTitle")}
            </span>
            <span className="mt-2 block text-sm text-muted">
              {t("masterCv.onboarding.manualDescription")}
            </span>
          </button>
        </div>
      </section>
    );
  }

  if (step === "upload") {
    return (
      <section className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => setStep("choice")}
          className="text-sm font-semibold text-brand"
        >
          {t("masterCv.onboarding.back")}
        </button>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          {t("masterCv.onboarding.uploadHeading")}
        </h1>
        <p className="mt-2 text-muted">{t("masterCv.onboarding.uploadHint")}</p>
        <div className="cc-card mt-8 p-6">
          <input
            type="file"
            accept="application/pdf,.pdf"
            aria-label={t("masterCv.onboarding.fileLabel")}
            onChange={(event) => {
              setSelectedFile(event.target.files?.[0] ?? null);
              setUploadError(null);
            }}
            className="block w-full text-sm text-ink"
          />
          <button
            type="button"
            disabled={!selectedFile || isUploading}
            onClick={() => void handleUpload()}
            className="cc-btn-primary mt-5"
          >
            {isUploading
              ? t("masterCv.onboarding.extracting")
              : t("masterCv.onboarding.uploadAndExtract")}
          </button>

          {uploadError ? (
            <div className="cc-alert-error mt-5">
              <p role="alert" className="text-sm font-medium">
                {uploadError}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!selectedFile || isUploading}
                  onClick={() => void handleUpload()}
                  className="cc-btn-danger px-3 py-2"
                >
                  {t("masterCv.onboarding.retry")}
                </button>
                <button
                  type="button"
                  onClick={continueManually}
                  className="cc-btn-navy px-3 py-2"
                >
                  {t("masterCv.onboarding.completeManually")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl">
      <p className="cc-kicker">{t("masterCv.onboarding.reviewKicker")}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">
        {t("masterCv.onboarding.reviewTitle")}
      </h1>
      <p className="mt-2 mb-8 text-muted">
        {t("masterCv.onboarding.reviewDescription")}
      </p>
      <MasterCvForm
        initialValue={initialValue}
        submitLabel={t("masterCv.onboarding.save")}
        isSaving={isSaving}
        errorMessage={saveError}
        onSubmit={handleSave}
      />
    </section>
  );
}
