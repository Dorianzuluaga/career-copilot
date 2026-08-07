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

const editableFieldClassName =
  "w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-7 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function ReadOnlyBlock({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
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

function CoverLetterDocument({
  coverLetter,
  isEditing,
  onChange,
}: {
  coverLetter: CoverLetter;
  isEditing: boolean;
  onChange: (coverLetter: CoverLetter) => void;
}) {
  const contactDetails = [coverLetter.email, coverLetter.phone].filter(hasText);

  const header = (
    <header>
      <p className="text-2xl font-bold tracking-tight text-slate-950">
        {coverLetter.candidateName}
      </p>
      {contactDetails.length > 0 ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {contactDetails.join(" · ")}
        </p>
      ) : null}
      <p className="mt-4 text-sm text-slate-600">{coverLetter.date}</p>
      {hasText(coverLetter.companyName) ? (
        <p className="mt-1 text-sm text-slate-600">{coverLetter.companyName}</p>
      ) : null}
    </header>
  );

  const signature = (
    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
      {coverLetter.signature}
    </p>
  );

  return (
    <article
      aria-label="Cover Letter"
      className="rounded-xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10"
    >
      {isEditing ? <ReadOnlyBlock>{header}</ReadOnlyBlock> : header}

      <div className="mt-8 space-y-5 text-sm leading-7 text-slate-700">
        <EditableParagraph
          ariaLabel="Greeting"
          isEditing={isEditing}
          value={coverLetter.greeting}
          rows={2}
          onChange={(greeting) => onChange({ ...coverLetter, greeting })}
        />
        <EditableParagraph
          ariaLabel="Introduction"
          isEditing={isEditing}
          value={coverLetter.introduction}
          rows={4}
          onChange={(introduction) =>
            onChange({ ...coverLetter, introduction })
          }
        />
        <EditableParagraph
          ariaLabel="Professional value"
          isEditing={isEditing}
          value={coverLetter.professionalValue}
          rows={5}
          onChange={(professionalValue) =>
            onChange({ ...coverLetter, professionalValue })
          }
        />
        <EditableParagraph
          ariaLabel="Motivation"
          isEditing={isEditing}
          value={coverLetter.motivation}
          rows={4}
          onChange={(motivation) => onChange({ ...coverLetter, motivation })}
        />
        <EditableParagraph
          ariaLabel="Closing"
          isEditing={isEditing}
          value={coverLetter.closing}
          rows={3}
          onChange={(closing) => onChange({ ...coverLetter, closing })}
        />
      </div>

      <div className="mt-8">
        {isEditing ? <ReadOnlyBlock>{signature}</ReadOnlyBlock> : signature}
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
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Cover Letter</h2>
        <p className="mt-2 text-sm text-slate-600">
          Generating your Cover Letter…
        </p>
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
            <p className="text-sm font-semibold text-blue-700">
              Application document
            </p>
            <h2
              id="cover-letter-title"
              className="mt-1 text-2xl font-bold text-slate-950"
            >
              Cover Letter
            </h2>
            {isEditing ? (
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Edit the application-specific letter text. Header details and
                signature remain read-only.
              </p>
            ) : (
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
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
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Done editing
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Edit
              </button>
            )}
            {onSave ? (
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Generate again
            </button>
            {onContinueToExport ? (
              <button
                type="button"
                onClick={onContinueToExport}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continue to Export
              </button>
            ) : null}
          </div>
        </section>

        {savedMessage ? (
          <p role="status" className="text-sm font-medium text-green-700">
            {savedMessage}
          </p>
        ) : null}
        {saveErrorMessage ? (
          <p role="alert" className="text-sm font-medium text-red-700">
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
      className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8"
    >
      <p className="text-sm font-semibold text-blue-700">
        Application document
      </p>
      <h2
        id="cover-letter-title"
        className="mt-1 text-2xl font-bold text-slate-950"
      >
        Cover Letter
      </h2>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        {errorMessage ??
          "Generate a Cover Letter tailored to this job opportunity from your Master CV, Job Analysis, Profile Match, and saved Optimized CV."}
      </p>
      <button
        type="button"
        onClick={onGenerate}
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {errorMessage ? "Try again" : "Generate Cover Letter"}
      </button>
    </section>
  );
}
