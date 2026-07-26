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

  const fieldClassName =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <div>
        <label
          htmlFor="companyName"
          className="text-sm font-semibold text-slate-800"
        >
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
        <label
          htmlFor="jobTitle"
          className="text-sm font-semibold text-slate-800"
        >
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
        <label
          htmlFor="location"
          className="text-sm font-semibold text-slate-800"
        >
          Location{" "}
          <span className="font-normal text-slate-500">(optional)</span>
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
        <label
          htmlFor="jobUrl"
          className="text-sm font-semibold text-slate-800"
        >
          Job URL <span className="font-normal text-slate-500">(optional)</span>
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
          className="text-sm font-semibold text-slate-800"
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

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
