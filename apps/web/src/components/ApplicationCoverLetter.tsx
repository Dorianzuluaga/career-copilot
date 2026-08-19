import { useState, type ReactNode } from "react";
import type { CoverLetter } from "../types/cover-letter";

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
  const contactDetails = [coverLetter.email, coverLetter.phone].filter(hasText);
  const canEdit = isEditing && onChange !== undefined;

  const header = (
    <header>
      <p className="text-2xl font-bold tracking-tight text-ink">
        {coverLetter.candidateName}
      </p>
      {contactDetails.length > 0 ? (
        <p className="mt-2 text-sm leading-6 text-muted">
          {contactDetails.join(" · ")}
        </p>
      ) : null}
      <p className="mt-4 text-sm text-muted">{coverLetter.date}</p>
      {hasText(coverLetter.companyName) ? (
        <p className="mt-1 text-sm text-muted">{coverLetter.companyName}</p>
      ) : null}
    </header>
  );

  const signature = (
    <p className="whitespace-pre-wrap text-sm leading-7 text-ink">
      {coverLetter.signature}
    </p>
  );

  return (
    <article
      aria-label="Cover Letter"
      className="cc-card px-6 py-8 sm:px-10 sm:py-10"
    >
      {canEdit ? <ReadOnlyBlock>{header}</ReadOnlyBlock> : header}

      <div className="mt-8 space-y-5 text-sm leading-7 text-ink">
        <EditableParagraph
          ariaLabel="Greeting"
          isEditing={canEdit}
          value={coverLetter.greeting}
          rows={2}
          onChange={(greeting) => onChange?.({ ...coverLetter, greeting })}
        />
        <EditableParagraph
          ariaLabel="Introduction"
          isEditing={canEdit}
          value={coverLetter.introduction}
          rows={4}
          onChange={(introduction) =>
            onChange?.({ ...coverLetter, introduction })
          }
        />
        <EditableParagraph
          ariaLabel="Professional value"
          isEditing={canEdit}
          value={coverLetter.professionalValue}
          rows={5}
          onChange={(professionalValue) =>
            onChange?.({ ...coverLetter, professionalValue })
          }
        />
        <EditableParagraph
          ariaLabel="Motivation"
          isEditing={canEdit}
          value={coverLetter.motivation}
          rows={4}
          onChange={(motivation) => onChange?.({ ...coverLetter, motivation })}
        />
        <EditableParagraph
          ariaLabel="Closing"
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
  const [isEditing, setIsEditing] = useState(initialIsEditing);

  if (isLoading) {
    return (
      <section className="cc-card p-8 text-center">
        <h2 className="text-lg font-bold text-ink">Cover Letter</h2>
        <p className="mt-2 text-sm text-muted">Generating your Cover Letter…</p>
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
            <p className="cc-kicker">Application document</p>
            <h2
              id="cover-letter-title"
              className="mt-1 text-2xl font-bold text-ink"
            >
              Cover Letter
            </h2>
            {isEditing ? (
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Edit the application-specific letter text. Header details and
                signature remain read-only.
              </p>
            ) : (
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Review the generated document. Enter Edit mode to update the
                letter text.
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
                Done editing
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="cc-btn-primary"
              >
                Edit
              </button>
            )}
            {onSave ? (
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="cc-btn-secondary"
              >
                {isSaving ? "Saving…" : "Save"}
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
              Generate again
            </button>
            {onContinueToExport ? (
              <button
                type="button"
                onClick={onContinueToExport}
                className="cc-btn-secondary"
              >
                Continue to Export
              </button>
            ) : null}
          </div>
        </section>

        {savedMessage ? (
          <p role="status" className="text-sm font-medium text-success">
            {savedMessage}
          </p>
        ) : null}
        {saveErrorMessage ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {saveErrorMessage}
          </p>
        ) : null}

        <CoverLetterDocument
          coverLetter={coverLetter}
          isEditing={isEditing}
          onChange={onChange}
        />
      </div>
    );
  }

  return (
    <section
      aria-labelledby="cover-letter-title"
      className="cc-card p-6 text-center sm:p-8"
    >
      <p className="cc-kicker">Application document</p>
      <h2 id="cover-letter-title" className="mt-1 text-2xl font-bold text-ink">
        Cover Letter
      </h2>
      <p className="mt-4 text-sm leading-6 text-muted">
        {errorMessage ??
          "Generate a Cover Letter tailored to this job opportunity from your Master CV, Job Analysis, Profile Match, and saved Optimized CV."}
      </p>
      <button
        type="button"
        onClick={onGenerate}
        className="cc-btn-primary mt-6"
      >
        {errorMessage ? "Try again" : "Generate Cover Letter"}
      </button>
    </section>
  );
}
