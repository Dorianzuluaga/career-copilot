import { useState, type FormEvent } from "react";
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  MasterCvInput,
} from "../types/master-cv";

const fieldClassName =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const emptyExperience = (): ExperienceItem => ({
  jobTitle: null,
  company: null,
  location: null,
  startDate: null,
  endDate: null,
  current: false,
  description: null,
});

function nullable(value: string): string | null {
  return value.trim() || null;
}

function TextField({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required ? <span className="text-red-700"> *</span> : null}
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={fieldClassName}
      />
    </label>
  );
}

function SectionHeader({
  title,
  onAdd,
}: {
  title: string;
  onAdd?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      {onAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Add
        </button>
      ) : null}
    </div>
  );
}

export function MasterCvForm({
  initialValue,
  submitLabel,
  isSaving,
  errorMessage,
  onSubmit,
}: {
  initialValue: MasterCvInput;
  submitLabel: string;
  isSaving: boolean;
  errorMessage: string | null;
  onSubmit: (input: MasterCvInput) => Promise<void>;
}) {
  const [personal, setPersonal] = useState({
    fullName: initialValue.fullName,
    email: initialValue.email,
    phone: initialValue.phone,
    location: initialValue.location,
    linkedin: initialValue.linkedin,
    portfolio: initialValue.portfolio,
  });
  const [professionalSummary, setProfessionalSummary] = useState(
    initialValue.professionalSummary,
  );
  const [experience, setExperience] = useState(
    initialValue.experience.length > 0
      ? initialValue.experience
      : [emptyExperience()],
  );
  const [education, setEducation] = useState(initialValue.education);
  const [skills, setSkills] = useState(initialValue.skills.join(", "));
  const [languages, setLanguages] = useState(initialValue.languages);
  const [certifications, setCertifications] = useState(
    initialValue.certifications,
  );

  function updateExperience(index: number, patch: Partial<ExperienceItem>) {
    setExperience((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function updateEducation(index: number, patch: Partial<EducationItem>) {
    setEducation((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function updateLanguage(index: number, patch: Partial<LanguageItem>) {
    setLanguages((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function updateCertification(
    index: number,
    patch: Partial<CertificationItem>,
  ) {
    setCertifications((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      ...personal,
      phone: nullable(personal.phone ?? ""),
      location: nullable(personal.location ?? ""),
      linkedin: nullable(personal.linkedin ?? ""),
      portfolio: nullable(personal.portfolio ?? ""),
      professionalSummary: professionalSummary.trim(),
      experience,
      education,
      skills: skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      languages,
      certifications,
    });
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Personal information" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextField
            label="Full name"
            value={personal.fullName}
            required
            onChange={(fullName) =>
              setPersonal((value) => ({ ...value, fullName }))
            }
          />
          <TextField
            label="Email"
            type="email"
            value={personal.email}
            required
            onChange={(email) => setPersonal((value) => ({ ...value, email }))}
          />
          <TextField
            label="Phone"
            value={personal.phone}
            onChange={(phone) =>
              setPersonal((value) => ({ ...value, phone: nullable(phone) }))
            }
          />
          <TextField
            label="Location"
            value={personal.location}
            onChange={(location) =>
              setPersonal((value) => ({
                ...value,
                location: nullable(location),
              }))
            }
          />
          <TextField
            label="LinkedIn"
            value={personal.linkedin}
            onChange={(linkedin) =>
              setPersonal((value) => ({
                ...value,
                linkedin: nullable(linkedin),
              }))
            }
          />
          <TextField
            label="Portfolio"
            value={personal.portfolio}
            onChange={(portfolio) =>
              setPersonal((value) => ({
                ...value,
                portfolio: nullable(portfolio),
              }))
            }
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Professional summary" />
        <textarea
          value={professionalSummary}
          onChange={(event) => setProfessionalSummary(event.target.value)}
          required
          rows={6}
          className={fieldClassName}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          title="Experience"
          onAdd={() => setExperience((items) => [...items, emptyExperience()])}
        />
        <div className="mt-5 space-y-5">
          {experience.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Job title"
                  value={item.jobTitle}
                  onChange={(value) =>
                    updateExperience(index, { jobTitle: nullable(value) })
                  }
                />
                <TextField
                  label="Company"
                  value={item.company}
                  onChange={(value) =>
                    updateExperience(index, { company: nullable(value) })
                  }
                />
                <TextField
                  label="Location"
                  value={item.location}
                  onChange={(value) =>
                    updateExperience(index, { location: nullable(value) })
                  }
                />
                <TextField
                  label="Start date"
                  value={item.startDate}
                  onChange={(value) =>
                    updateExperience(index, { startDate: nullable(value) })
                  }
                />
                <TextField
                  label="End date"
                  value={item.endDate}
                  onChange={(value) =>
                    updateExperience(index, { endDate: nullable(value) })
                  }
                />
                <label className="flex items-center gap-2 self-end py-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={item.current ?? false}
                    onChange={(event) =>
                      updateExperience(index, {
                        current: event.target.checked,
                      })
                    }
                  />
                  Current role
                </label>
              </div>
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={item.description ?? ""}
                  onChange={(event) =>
                    updateExperience(index, {
                      description: nullable(event.target.value),
                    })
                  }
                  rows={4}
                  className={fieldClassName}
                />
              </label>
              {experience.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setExperience((items) =>
                      items.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  className="mt-3 text-sm font-semibold text-red-700"
                >
                  Remove experience
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          title="Education"
          onAdd={() =>
            setEducation((items) => [
              ...items,
              {
                institution: null,
                degree: null,
                fieldOfStudy: null,
                startDate: null,
                endDate: null,
                description: null,
              },
            ])
          }
        />
        <div className="mt-5 space-y-5">
          {education.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Institution"
                  value={item.institution}
                  onChange={(value) =>
                    updateEducation(index, { institution: nullable(value) })
                  }
                />
                <TextField
                  label="Degree"
                  value={item.degree}
                  onChange={(value) =>
                    updateEducation(index, { degree: nullable(value) })
                  }
                />
                <TextField
                  label="Field of study"
                  value={item.fieldOfStudy}
                  onChange={(value) =>
                    updateEducation(index, { fieldOfStudy: nullable(value) })
                  }
                />
                <TextField
                  label="Start date"
                  value={item.startDate}
                  onChange={(value) =>
                    updateEducation(index, { startDate: nullable(value) })
                  }
                />
                <TextField
                  label="End date"
                  value={item.endDate}
                  onChange={(value) =>
                    updateEducation(index, { endDate: nullable(value) })
                  }
                />
              </div>
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={item.description ?? ""}
                  onChange={(event) =>
                    updateEducation(index, {
                      description: nullable(event.target.value),
                    })
                  }
                  rows={3}
                  className={fieldClassName}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  setEducation((items) =>
                    items.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="mt-3 text-sm font-semibold text-red-700"
              >
                Remove education
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Skills" />
        <label className="mt-5 block text-sm font-medium text-slate-700">
          Skills, separated by commas <span className="text-red-700">*</span>
          <input
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            required
            className={fieldClassName}
          />
        </label>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          title="Languages"
          onAdd={() =>
            setLanguages((items) => [
              ...items,
              { name: null, proficiency: null },
            ])
          }
        />
        <div className="mt-5 space-y-4">
          {languages.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto]"
            >
              <TextField
                label="Language"
                value={item.name}
                onChange={(value) =>
                  updateLanguage(index, { name: nullable(value) })
                }
              />
              <TextField
                label="Proficiency"
                value={item.proficiency}
                onChange={(value) =>
                  updateLanguage(index, { proficiency: nullable(value) })
                }
              />
              <button
                type="button"
                onClick={() =>
                  setLanguages((items) =>
                    items.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="self-end py-2 text-sm font-semibold text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          title="Certifications"
          onAdd={() =>
            setCertifications((items) => [
              ...items,
              {
                name: null,
                issuer: null,
                issueDate: null,
                credentialUrl: null,
              },
            ])
          }
        />
        <div className="mt-5 space-y-4">
          {certifications.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Certification"
                  value={item.name}
                  onChange={(value) =>
                    updateCertification(index, { name: nullable(value) })
                  }
                />
                <TextField
                  label="Issuer"
                  value={item.issuer}
                  onChange={(value) =>
                    updateCertification(index, { issuer: nullable(value) })
                  }
                />
                <TextField
                  label="Issue date"
                  value={item.issueDate}
                  onChange={(value) =>
                    updateCertification(index, { issueDate: nullable(value) })
                  }
                />
                <TextField
                  label="Credential URL"
                  value={item.credentialUrl}
                  onChange={(value) =>
                    updateCertification(index, {
                      credentialUrl: nullable(value),
                    })
                  }
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setCertifications((items) =>
                    items.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="mt-3 text-sm font-semibold text-red-700"
              >
                Remove certification
              </button>
            </div>
          ))}
        </div>
      </section>

      {errorMessage ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
