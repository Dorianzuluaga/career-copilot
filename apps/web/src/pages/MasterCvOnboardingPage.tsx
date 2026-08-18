import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { MasterCvForm } from "../components/MasterCvForm";
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
          : "We couldn't extract your CV automatically.",
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
          : "Unable to save your Master CV.",
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
    return <p className="text-sm text-slate-600">Loading your profile…</p>;
  }
  if (existingMasterCv) return <Navigate to="/master-cv" replace />;

  if (step === "choice") {
    return (
      <section className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-blue-700">Master CV</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Do you already have a CV?
        </h1>
        <p className="mt-3 text-slate-600">
          Create the professional profile Career Copilot will use as your source
          of truth.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setStep("upload")}
            className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-300"
          >
            <span className="text-lg font-bold">Upload existing CV</span>
            <span className="mt-2 block text-sm text-slate-600">
              Upload a PDF and review the extracted information.
            </span>
          </button>
          <button
            type="button"
            onClick={continueManually}
            className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-300"
          >
            <span className="text-lg font-bold">Create manually</span>
            <span className="mt-2 block text-sm text-slate-600">
              Start with an empty form and enter your information.
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
          className="text-sm font-semibold text-blue-700"
        >
          Back
        </button>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Upload your CV
        </h1>
        <p className="mt-2 text-slate-600">PDF only, up to 10 MB.</p>
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => {
              setSelectedFile(event.target.files?.[0] ?? null);
              setUploadError(null);
            }}
            className="block w-full text-sm text-slate-700"
          />
          <button
            type="button"
            disabled={!selectedFile || isUploading}
            onClick={() => void handleUpload()}
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Extracting…" : "Upload and extract"}
          </button>

          {uploadError ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
              <p role="alert" className="text-sm font-medium text-red-800">
                {uploadError}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!selectedFile || isUploading}
                  onClick={() => void handleUpload()}
                  className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={continueManually}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                >
                  Complete manually
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
      <p className="text-sm font-semibold text-blue-700">
        Master CV onboarding
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">
        Review your information
      </h1>
      <p className="mt-2 mb-8 text-slate-600">
        Complete all required fields before saving your Master CV.
      </p>
      <MasterCvForm
        initialValue={initialValue}
        submitLabel="Save Master CV"
        isSaving={isSaving}
        errorMessage={saveError}
        onSubmit={handleSave}
      />
    </section>
  );
}
