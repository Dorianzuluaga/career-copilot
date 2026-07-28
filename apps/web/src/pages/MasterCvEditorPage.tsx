import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { MasterCvForm } from "../components/MasterCvForm";
import { MasterCvImport } from "../components/MasterCvImport";
import { ApiError, getMasterCv, updateMasterCv } from "../services/master-cv";
import type { MasterCvInput } from "../types/master-cv";

export function MasterCvEditorPage() {
  const [formValue, setFormValue] = useState<MasterCvInput | null>(null);
  const [formRevision, setFormRevision] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMissing, setIsMissing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    void getMasterCv()
      .then((value) => {
        if (!isActive) return;
        if (value) setFormValue(value);
        else setIsMissing(true);
      })
      .catch((error) => {
        if (isActive) {
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : "Unable to load your Master CV.",
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  async function handleSave(input: MasterCvInput) {
    setErrorMessage(null);
    setSavedMessage(null);
    setIsSaving(true);
    try {
      const updated = await updateMasterCv(input);
      setFormValue(updated);
      setSavedMessage("Master CV saved.");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to save your Master CV.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleImport(input: MasterCvInput) {
    setFormValue(input);
    setFormRevision((revision) => revision + 1);
    setSavedMessage(null);
    setErrorMessage(null);
  }

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading your Master CV…</p>;
  }
  if (isMissing) return <Navigate to="/onboarding/master-cv" replace />;

  if (!formValue) {
    return (
      <p role="alert" className="text-sm font-medium text-red-700">
        {errorMessage}
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">
            Professional profile
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Edit your Master CV
          </h1>
          <p className="mt-2 text-slate-600">
            Keep your source profile accurate for future applications.
          </p>
        </div>
        <MasterCvImport onImport={handleImport} />
      </div>
      {savedMessage ? (
        <p role="status" className="mt-5 text-sm font-medium text-green-700">
          {savedMessage}
        </p>
      ) : null}
      <div className="mt-8">
        <MasterCvForm
          key={formRevision}
          initialValue={formValue}
          submitLabel="Save changes"
          isSaving={isSaving}
          errorMessage={errorMessage}
          onSubmit={handleSave}
        />
      </div>
    </section>
  );
}
