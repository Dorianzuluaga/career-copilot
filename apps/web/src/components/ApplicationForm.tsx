import { useState, type FormEvent } from "react";
import { ValidationToast } from "./ValidationToast";
import { useSaveValidationFeedback } from "../hooks/useSaveValidationFeedback";
import { getApplicationFieldErrors } from "../lib/field-validation";
import type { ApplicationInput } from "../types/application";

interface ApplicationFormProps {
  initialValues?: ApplicationInput;
  submitLabel: string;
  onSubmit: (input: ApplicationInput) => void;
  onCancel: () => void;
}

const emptyApplication: ApplicationInput = {
  companyName: "",
  jobTitle: "",
  location: "",
  jobUrl: "",
  jobDescription: "",
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm font-medium text-danger">
      {message}
    </p>
  );
}

export function ApplicationForm({
  initialValues = emptyApplication,
  submitLabel,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const [values, setValues] = useState(initialValues);
  const { fieldErrors, toastMessage, reportFieldErrors, clearFieldError } =
    useSaveValidationFeedback();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: ApplicationInput = {
      companyName: values.companyName.trim(),
      jobTitle: values.jobTitle.trim(),
      location: values.location.trim(),
      jobUrl: values.jobUrl.trim(),
      jobDescription: values.jobDescription.trim(),
    };
    if (reportFieldErrors(getApplicationFieldErrors(input))) return;
    onSubmit(input);
  }

  function updateField(field: keyof ApplicationInput, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    clearFieldError(field);
  }

  const fieldClassName = "cc-field mt-2 py-2.5";

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="cc-card space-y-6 p-5 sm:p-8"
    >
      <ValidationToast message={toastMessage} />
      <div>
        <label htmlFor="companyName" className="text-sm font-semibold text-ink">
          Company name
        </label>
        <input
          id="companyName"
          name="companyName"
          data-field="companyName"
          value={values.companyName}
          onChange={(event) => updateField("companyName", event.target.value)}
          className={fieldClassName}
          autoComplete="organization"
          required
          aria-invalid={Boolean(fieldErrors.companyName)}
          aria-describedby={
            fieldErrors.companyName ? "companyName-error" : undefined
          }
        />
        <FieldError id="companyName-error" message={fieldErrors.companyName} />
      </div>

      <div>
        <label htmlFor="jobTitle" className="text-sm font-semibold text-ink">
          Job title
        </label>
        <input
          id="jobTitle"
          name="jobTitle"
          data-field="jobTitle"
          value={values.jobTitle}
          onChange={(event) => updateField("jobTitle", event.target.value)}
          className={fieldClassName}
          autoComplete="organization-title"
          required
          aria-invalid={Boolean(fieldErrors.jobTitle)}
          aria-describedby={fieldErrors.jobTitle ? "jobTitle-error" : undefined}
        />
        <FieldError id="jobTitle-error" message={fieldErrors.jobTitle} />
      </div>

      <div>
        <label htmlFor="location" className="text-sm font-semibold text-ink">
          Location <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="location"
          name="location"
          value={values.location}
          onChange={(event) => updateField("location", event.target.value)}
          className={fieldClassName}
          autoComplete="address-level2"
        />
      </div>

      <div>
        <label htmlFor="jobUrl" className="text-sm font-semibold text-ink">
          Job URL <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="jobUrl"
          name="jobUrl"
          data-field="jobUrl"
          type="url"
          value={values.jobUrl}
          onChange={(event) => updateField("jobUrl", event.target.value)}
          className={fieldClassName}
          placeholder="https://example.com/job"
          aria-invalid={Boolean(fieldErrors.jobUrl)}
          aria-describedby={fieldErrors.jobUrl ? "jobUrl-error" : undefined}
        />
        <FieldError id="jobUrl-error" message={fieldErrors.jobUrl} />
      </div>

      <div>
        <label
          htmlFor="jobDescription"
          className="text-sm font-semibold text-ink"
        >
          Job Description
        </label>
        <textarea
          id="jobDescription"
          name="jobDescription"
          data-field="jobDescription"
          value={values.jobDescription}
          onChange={(event) =>
            updateField("jobDescription", event.target.value)
          }
          className={`${fieldClassName} min-h-48 resize-y`}
          required
          aria-invalid={Boolean(fieldErrors.jobDescription)}
          aria-describedby={
            fieldErrors.jobDescription ? "jobDescription-error" : undefined
          }
        />
        <FieldError
          id="jobDescription-error"
          message={fieldErrors.jobDescription}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="cc-btn-secondary">
          Cancel
        </button>
        <button type="submit" className="cc-btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
