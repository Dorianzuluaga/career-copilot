import { useState, type FormEvent } from "react";
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

export function ApplicationForm({
  initialValues = emptyApplication,
  submitLabel,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const [values, setValues] = useState<ApplicationInput>(initialValues);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      companyName: values.companyName.trim(),
      jobTitle: values.jobTitle.trim(),
      location: values.location.trim(),
      jobUrl: values.jobUrl.trim(),
      jobDescription: values.jobDescription.trim(),
    });
  }

  function updateField(field: keyof ApplicationInput, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  const fieldClassName = "cc-field mt-2 py-2.5";

  return (
    <form onSubmit={handleSubmit} className="cc-card space-y-6 p-5 sm:p-8">
      <div>
        <label htmlFor="companyName" className="text-sm font-semibold text-ink">
          Company name
        </label>
        <input
          id="companyName"
          name="companyName"
          value={values.companyName}
          onChange={(event) => updateField("companyName", event.target.value)}
          className={fieldClassName}
          autoComplete="organization"
          required
        />
      </div>

      <div>
        <label htmlFor="jobTitle" className="text-sm font-semibold text-ink">
          Job title
        </label>
        <input
          id="jobTitle"
          name="jobTitle"
          value={values.jobTitle}
          onChange={(event) => updateField("jobTitle", event.target.value)}
          className={fieldClassName}
          autoComplete="organization-title"
          required
        />
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
          type="url"
          value={values.jobUrl}
          onChange={(event) => updateField("jobUrl", event.target.value)}
          className={fieldClassName}
          placeholder="https://example.com/job"
        />
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
          value={values.jobDescription}
          onChange={(event) =>
            updateField("jobDescription", event.target.value)
          }
          className={`${fieldClassName} min-h-48 resize-y`}
          required
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
