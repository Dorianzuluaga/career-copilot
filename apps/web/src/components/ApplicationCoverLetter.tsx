import { useState, type ReactNode } from "react";
import { ValidationToast } from "./ValidationToast";
import type { LocaleContextValue } from "../context/locale-context";
import { useLocale } from "../hooks/useLocale";
import { useSaveValidationFeedback } from "../hooks/useSaveValidationFeedback";
import type { TranslationKey } from "../i18n/messages";
import {
  getCoverLetterFieldErrors,
  hasFieldErrors,
  type FieldErrors,
} from "../lib/field-validation";
import type { CoverLetter } from "../types/cover-letter";

type Translate = LocaleContextValue["t"];

interface ApplicationCoverLetterProps {
  coverLetter: CoverLetter | null;
  errorMessage: string | null;
  initialIsEditing?: boolean;
  isLoading: boolean;
  isSaving?: boolean;
  onChange: (coverLetter: CoverLetter) => void;
  onContinueToExport?: () => void;
  onGenerate: () => void;
  onSave?: () => void;
  saveErrorMessage?: string | null;
  savedMessage?: string | null;
}

const editableFieldClassName = "cc-field resize-y leading-7";

const COVER_LETTER_VALIDATION_KEYS: Record<string, TranslationKey> = {
  "Candidate name is required.": "coverLetter.validation.candidateNameRequired",
  "Email is required.": "masterCv.validation.emailRequired",
  "Enter a valid email address.": "masterCv.validation.emailInvalid",
  "Enter a valid phone number.": "masterCv.validation.phoneInvalid",
  "Date is required.": "coverLetter.validation.dateRequired",
  "Enter a valid date.": "masterCv.validation.dateInvalid",
  "Signature is required.": "coverLetter.validation.signatureRequired",
};

function translateCoverLetterFieldErrors(
  errors: FieldErrors,
  t: Translate,
): FieldErrors {
  return Object.fromEntries(
    Object.entries(errors).map(([key, message]) => {
      const translationKey = COVER_LETTER_VALIDATION_KEYS[message];
      return [key, translationKey ? t(translationKey) : message];
    }),
  );
}

function getCoverLetterToastFieldLabel(key: string, t: Translate): string {
  const labels: Record<string, TranslationKey> = {
    candidateName: "coverLetter.fields.candidateName",
    email: "masterCv.form.email",
    phone: "masterCv.form.phone",
    date: "coverLetter.fields.date",
    signature: "coverLetter.fields.signature",
  };
  const label = labels[key];
  return label ? t(label) : key;
}

function listCoverLetterFieldNames(names: string[], t: Translate): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) {
    return t("masterCv.toast.pair", { first: names[0], second: names[1] });
  }
  if (names.length <= 4) {
    return t("masterCv.toast.list", {
      items: names.slice(0, -1).join(", "),
      last: names[names.length - 1],
    });
  }
  return t("masterCv.toast.more", {
    items: names.slice(0, 3).join(", "),
    count: names.length - 3,
  });
}

function getCoverLetterToastMessage(
  errors: FieldErrors,
  t: Translate,
): string | null {
  const keys = Object.keys(errors);
  if (keys.length === 0) return null;

  const fields = listCoverLetterFieldNames(
    keys.map((key) => getCoverLetterToastFieldLabel(key, t)),
    t,
  );
  return t(
    keys.length === 1 ? "masterCv.toast.single" : "masterCv.toast.multiple",
    { fields },
  );
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function ReadOnlyBlock({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-canvas px-3 py-2">
      {children}
    </div>
  );
}

function EditableParagraph({
  ariaLabel,
  isEditing,
  onChange,
  rows,
  value,
}: {
  ariaLabel: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  rows: number;
  value: string;
}) {
  if (isEditing) {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        aria-label={ariaLabel}
        className={editableFieldClassName}
      />
    );
  }

  if (!hasText(value)) {
    return null;
  }

  return <p className="whitespace-pre-wrap">{value}</p>;
}

export function CoverLetterDocument({
  coverLetter,
  isEditing = false,
  onChange,
}: {
  coverLetter: CoverLetter;
  isEditing?: boolean;
  onChange?: (coverLetter: CoverLetter) => void;
}) {
  const { t } = useLocale();
  const canEdit = isEditing && onChange !== undefined;

  const header = (
    <header>
      <p
        className="text-2xl font-bold tracking-tight text-ink"
        data-field="candidateName"
        tabIndex={-1}
      >
        {coverLetter.candidateName}
      </p>
      {hasText(coverLetter.email) || hasText(coverLetter.phone) ? (
        <p className="mt-2 text-sm leading-6 text-muted">
          {hasText(coverLetter.email) ? (
            <span data-field="email" tabIndex={-1}>
              {coverLetter.email}
            </span>
          ) : null}
          {hasText(coverLetter.email) && hasText(coverLetter.phone)
            ? " · "
            : null}
          {hasText(coverLetter.phone) ? (
            <span data-field="phone" tabIndex={-1}>
              {coverLetter.phone}
            </span>
          ) : null}
        </p>
      ) : null}
      <p className="mt-4 text-sm text-muted" data-field="date" tabIndex={-1}>
        {coverLetter.date}
      </p>
      {hasText(coverLetter.companyName) ? (
        <p className="mt-1 text-sm text-muted">{coverLetter.companyName}</p>
      ) : null}
    </header>
  );

  const signature = (
    <p
      className="whitespace-pre-wrap text-sm leading-7 text-ink"
      data-field="signature"
      tabIndex={-1}
    >
      {coverLetter.signature}
    </p>
  );

  return (
    <article
      aria-label={t("coverLetter.title")}
      className="cc-card px-6 py-8 sm:px-10 sm:py-10"
    >
      {canEdit ? <ReadOnlyBlock>{header}</ReadOnlyBlock> : header}

      <div className="mt-8 space-y-5 text-sm leading-7 text-ink">
        <EditableParagraph
          ariaLabel={t("coverLetter.greetingAria")}
          isEditing={canEdit}
          value={coverLetter.greeting}
          rows={2}
          onChange={(greeting) => onChange?.({ ...coverLetter, greeting })}
        />
        <EditableParagraph
          ariaLabel={t("coverLetter.introductionAria")}
          isEditing={canEdit}
          value={coverLetter.introduction}
          rows={4}
          onChange={(introduction) =>
            onChange?.({ ...coverLetter, introduction })
          }
        />
        <EditableParagraph
          ariaLabel={t("coverLetter.professionalValueAria")}
          isEditing={canEdit}
          value={coverLetter.professionalValue}
          rows={5}
          onChange={(professionalValue) =>
            onChange?.({ ...coverLetter, professionalValue })
          }
        />
        <EditableParagraph
          ariaLabel={t("coverLetter.motivationAria")}
          isEditing={canEdit}
          value={coverLetter.motivation}
          rows={4}
          onChange={(motivation) => onChange?.({ ...coverLetter, motivation })}
        />
        <EditableParagraph
          ariaLabel={t("coverLetter.closingAria")}
          isEditing={canEdit}
          value={coverLetter.closing}
          rows={3}
          onChange={(closing) => onChange?.({ ...coverLetter, closing })}
        />
      </div>

      <div className="mt-8">
        {canEdit ? <ReadOnlyBlock>{signature}</ReadOnlyBlock> : signature}
      </div>
    </article>
  );
}

export function ApplicationCoverLetter({
  coverLetter,
  errorMessage,
  initialIsEditing = false,
  isLoading,
  isSaving = false,
  onChange,
  onContinueToExport,
  onGenerate,
  onSave,
  saveErrorMessage = null,
  savedMessage = null,
}: ApplicationCoverLetterProps) {
  const { t } = useLocale();
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const { fieldErrors, reportFieldErrors, clearAllFieldErrors } =
    useSaveValidationFeedback();

  function handleChange(next: CoverLetter) {
    clearAllFieldErrors();
    onChange(next);
  }

  function handleSave() {
    if (!coverLetter || !onSave) return;
    if (
      reportFieldErrors(
        translateCoverLetterFieldErrors(
          getCoverLetterFieldErrors(coverLetter),
          t,
        ),
      )
    ) {
      return;
    }
    onSave();
  }

  if (isLoading) {
    return (
      <section className="cc-card p-8 text-center">
        <h2 className="text-lg font-bold text-ink">{t("coverLetter.title")}</h2>
        <p className="mt-2 text-sm text-muted">{t("coverLetter.loading")}</p>
      </section>
    );
  }

  if (coverLetter) {
    return (
      <div className="space-y-6">
        <section
          aria-labelledby="cover-letter-title"
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <p className="cc-kicker">{t("coverLetter.kicker")}</p>
            <h2
              id="cover-letter-title"
              className="mt-1 text-2xl font-bold text-ink"
            >
              {t("coverLetter.title")}
            </h2>
            {isEditing ? (
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                {t("coverLetter.editDescription")}
              </p>
            ) : (
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                {t("coverLetter.reviewDescription")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="cc-btn-primary"
              >
                {t("coverLetter.doneEditing")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="cc-btn-primary"
              >
                {t("coverLetter.edit")}
              </button>
            )}
            {onSave ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="cc-btn-secondary"
              >
                {isSaving ? t("coverLetter.saving") : t("coverLetter.save")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                onGenerate();
              }}
              className="cc-btn-secondary"
            >
              {t("coverLetter.generateAgain")}
            </button>
            {onContinueToExport ? (
              <button
                type="button"
                onClick={onContinueToExport}
                className="cc-btn-secondary"
              >
                {t("coverLetter.continueToExport")}
              </button>
            ) : null}
          </div>
        </section>

        {savedMessage ? (
          <p role="status" className="text-sm font-medium text-success">
            {savedMessage}
          </p>
        ) : null}
        <ValidationToast message={getCoverLetterToastMessage(fieldErrors, t)} />
        {saveErrorMessage ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {saveErrorMessage}
          </p>
        ) : null}
        {hasFieldErrors(fieldErrors) ? (
          <div role="alert" className="space-y-1">
            {Object.entries(fieldErrors).map(([key, message]) => (
              <p key={key} className="text-sm font-medium text-danger">
                {message}
              </p>
            ))}
          </div>
        ) : null}

        <CoverLetterDocument
          coverLetter={coverLetter}
          isEditing={isEditing}
          onChange={handleChange}
        />
      </div>
    );
  }

  return (
    <section
      aria-labelledby="cover-letter-title"
      className="cc-card p-6 text-center sm:p-8"
    >
      <p className="cc-kicker">{t("coverLetter.kicker")}</p>
      <h2 id="cover-letter-title" className="mt-1 text-2xl font-bold text-ink">
        {t("coverLetter.title")}
      </h2>
      <p className="mt-4 text-sm leading-6 text-muted">
        {errorMessage ?? t("coverLetter.generateDescription")}
      </p>
      <button
        type="button"
        onClick={onGenerate}
        className="cc-btn-primary mt-6"
      >
        {errorMessage ? t("coverLetter.tryAgain") : t("coverLetter.generate")}
      </button>
    </section>
  );
}
