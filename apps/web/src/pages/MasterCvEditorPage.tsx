import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { MasterCvForm } from "../components/MasterCvForm";
import { MasterCvImport } from "../components/MasterCvImport";
import { useLocale } from "../hooks/useLocale";
import { ApiError, getMasterCv, updateMasterCv } from "../services/master-cv";
import type { MasterCvInput } from "../types/master-cv";

export function MasterCvEditorPage() {
  const { t } = useLocale();
  const [formValue, setFormValue] = useState<MasterCvInput | null>(null);
  const [formRevision, setFormRevision] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMissing, setIsMissing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

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
              : t("masterCv.editor.loadFailed"),
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [t]);

  async function handleSave(input: MasterCvInput) {
    setErrorMessage(null);
    setIsSaved(false);
    setIsSaving(true);
    try {
      const updated = await updateMasterCv(input);
      setFormValue(updated);
      setIsSaved(true);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : t("masterCv.editor.saveFailed"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleImport(input: MasterCvInput) {
    setFormValue(input);
    setFormRevision((revision) => revision + 1);
    setIsSaved(false);
    setErrorMessage(null);
  }

  if (isLoading) {
    return <p className="text-sm text-muted">{t("masterCv.editor.loading")}</p>;
  }
  if (isMissing) return <Navigate to="/onboarding/master-cv" replace />;

  if (!formValue) {
    return (
      <p role="alert" className="text-sm font-medium text-danger">
        {errorMessage}
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="cc-kicker">{t("masterCv.editor.kicker")}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {t("masterCv.editor.title")}
          </h1>
          <p className="mt-2 text-muted">{t("masterCv.editor.description")}</p>
        </div>
        <MasterCvImport onImport={handleImport} />
      </div>
      {isSaved ? (
        <p role="status" className="mt-5 text-sm font-medium text-success">
          {t("masterCv.editor.saved")}
        </p>
      ) : null}
      <div className="mt-8">
        <MasterCvForm
          key={formRevision}
          initialValue={formValue}
          submitLabel={t("masterCv.editor.save")}
          isSaving={isSaving}
          errorMessage={errorMessage}
          onSubmit={handleSave}
        />
      </div>
    </section>
  );
}
