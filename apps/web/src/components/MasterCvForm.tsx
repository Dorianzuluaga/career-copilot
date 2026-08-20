import { useState, type FormEvent } from "react";
import { ValidationToast } from "./ValidationToast";
import { useSaveValidationFeedback } from "../hooks/useSaveValidationFeedback";
import { getMasterCvFieldErrors } from "../lib/field-validation";
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  MasterCvInput,
  PersonalProjectItem,
} from "../types/master-cv";

const fieldClassName = "cc-field mt-1";

const emptyExperience = (): ExperienceItem => ({
  jobTitle: null,
  company: null,
  location: null,
  startDate: null,
  endDate: null,
  current: false,
  description: null,
});

const emptyEducation = (): EducationItem => ({
  institution: null,
  degree: null,
  fieldOfStudy: null,
  startDate: null,
  endDate: null,
  description: null,
});

const emptyPersonalProject = (): PersonalProjectItem => ({
  name: null,
  description: null,
  technologies: null,
  url: null,
});

function moveItem<T>(items: T[], index: number, offset: number): T[] {
  const nextIndex = index + offset;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

/** Trim optional text when submitting. Whitespace-only values become null. */
export function nullable(value: string): string | null {
  return value.trim() || null;
}

/** Keep typed characters, including spaces. Only empty input becomes null. */
export function optionalFieldValue(value: string): string | null {
  return value === "" ? null : value;
}

function normalizeExperience(item: ExperienceItem): ExperienceItem {
  return {
    jobTitle: nullable(item.jobTitle ?? ""),
    company: nullable(item.company ?? ""),
    location: nullable(item.location ?? ""),
    startDate: nullable(item.startDate ?? ""),
    endDate: nullable(item.endDate ?? ""),
    current: item.current,
    description: nullable(item.description ?? ""),
  };
}

function normalizeEducation(item: EducationItem): EducationItem {
  return {
    institution: nullable(item.institution ?? ""),
    degree: nullable(item.degree ?? ""),
    fieldOfStudy: nullable(item.fieldOfStudy ?? ""),
    startDate: nullable(item.startDate ?? ""),
    endDate: nullable(item.endDate ?? ""),
    description: nullable(item.description ?? ""),
  };
}

function normalizePersonalProject(
  item: PersonalProjectItem,
): PersonalProjectItem {
  return {
    name: nullable(item.name ?? ""),
    description: nullable(item.description ?? ""),
    technologies: nullable(item.technologies ?? ""),
    url: nullable(item.url ?? ""),
  };
}

function normalizeLanguage(item: LanguageItem): LanguageItem {
  return {
    name: nullable(item.name ?? ""),
    proficiency: nullable(item.proficiency ?? ""),
  };
}

function normalizeCertification(item: CertificationItem): CertificationItem {
  return {
    name: nullable(item.name ?? ""),
    issuer: nullable(item.issuer ?? ""),
    issueDate: nullable(item.issueDate ?? ""),
    credentialUrl: nullable(item.credentialUrl ?? ""),
  };
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm font-medium text-danger">
      {message}
    </p>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
  type = "text",
  error,
  id,
  fieldKey,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  error?: string;
  id?: string;
  fieldKey?: string;
}) {
  const fieldId = id;
  const errorId = fieldId ? `${fieldId}-error` : undefined;
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      {required ? <span className="text-danger"> *</span> : null}
      <input
        id={fieldId}
        data-field={fieldKey}
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={fieldClassName}
      />
      <FieldError id={errorId} message={error} />
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
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      {onAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="cc-btn-secondary px-3 py-1.5"
        >
          Add
        </button>
      ) : null}
    </div>
  );
}

function CollectionActions({
  index,
  total,
  label,
  onMove,
  onRemove,
  removeLabel,
}: {
  index: number;
  total: number;
  label: string;
  onMove: (offset: number) => void;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  if (total <= 1 && !onRemove) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      {total > 1 ? (
        <>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label={`Move ${label} up`}
            className="cc-btn-secondary px-3 py-1.5"
          >
            Move up
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            aria-label={`Move ${label} down`}
            className="cc-btn-secondary px-3 py-1.5"
          >
            Move down
          </button>
        </>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="text-sm font-semibold text-danger"
        >
          {removeLabel}
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
  const [personalProjects, setPersonalProjects] = useState(
    initialValue.personalProjects ?? [],
  );
  const [skills, setSkills] = useState(initialValue.skills.join(", "));
  const [languages, setLanguages] = useState(initialValue.languages);
  const [certifications, setCertifications] = useState(
    initialValue.certifications,
  );
  const { fieldErrors, toastMessage, reportFieldErrors, clearFieldError } =
    useSaveValidationFeedback();

  function buildInput(): MasterCvInput {
    return {
      ...personal,
      phone: nullable(personal.phone ?? ""),
      location: nullable(personal.location ?? ""),
      linkedin: nullable(personal.linkedin ?? ""),
      portfolio: nullable(personal.portfolio ?? ""),
      professionalSummary: professionalSummary.trim(),
      experience: experience.map(normalizeExperience),
      education: education.map(normalizeEducation),
      personalProjects: personalProjects.map(normalizePersonalProject),
      skills: skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      languages: languages.map(normalizeLanguage),
      certifications: certifications.map(normalizeCertification),
    };
  }

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

  function updatePersonalProject(
    index: number,
    patch: Partial<PersonalProjectItem>,
  ) {
    setPersonalProjects((items) =>
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
    const input = buildInput();
    const nextErrors = getMasterCvFieldErrors(input);
    if (reportFieldErrors(nextErrors)) return;
    await onSubmit(input);
  }

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-8"
    >
      <ValidationToast message={toastMessage} />
      <section className="cc-card p-6">
        <SectionHeader title="Personal information" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextField
            id="full-name"
            fieldKey="fullName"
            label="Full name"
            value={personal.fullName}
            required
            error={fieldErrors.fullName}
            onChange={(fullName) => {
              clearFieldError("fullName");
              setPersonal((value) => ({ ...value, fullName }));
            }}
          />
          <TextField
            id="email"
            fieldKey="email"
            label="Email"
            type="email"
            value={personal.email}
            required
            error={fieldErrors.email}
            onChange={(email) => {
              clearFieldError("email");
              setPersonal((value) => ({ ...value, email }));
            }}
          />
          <TextField
            id="phone"
            fieldKey="phone"
            label="Phone"
            value={personal.phone}
            error={fieldErrors.phone}
            onChange={(phone) => {
              clearFieldError("phone");
              setPersonal((value) => ({
                ...value,
                phone: optionalFieldValue(phone),
              }));
            }}
          />
          <TextField
            label="Location"
            value={personal.location}
            onChange={(location) =>
              setPersonal((value) => ({
                ...value,
                location: optionalFieldValue(location),
              }))
            }
          />
          <TextField
            id="linkedin"
            fieldKey="linkedin"
            label="LinkedIn"
            value={personal.linkedin}
            error={fieldErrors.linkedin}
            onChange={(linkedin) => {
              clearFieldError("linkedin");
              setPersonal((value) => ({
                ...value,
                linkedin: optionalFieldValue(linkedin),
              }));
            }}
          />
          <TextField
            id="portfolio"
            fieldKey="portfolio"
            label="Portfolio"
            value={personal.portfolio}
            error={fieldErrors.portfolio}
            onChange={(portfolio) => {
              clearFieldError("portfolio");
              setPersonal((value) => ({
                ...value,
                portfolio: optionalFieldValue(portfolio),
              }));
            }}
          />
        </div>
      </section>

      <section className="cc-card p-6">
        <SectionHeader title="Professional summary" />
        <textarea
          id="professional-summary"
          data-field="professionalSummary"
          value={professionalSummary}
          onChange={(event) => {
            clearFieldError("professionalSummary");
            setProfessionalSummary(event.target.value);
          }}
          required
          aria-invalid={Boolean(fieldErrors.professionalSummary)}
          aria-describedby={
            fieldErrors.professionalSummary
              ? "professional-summary-error"
              : undefined
          }
          rows={6}
          className={fieldClassName}
        />
        <FieldError
          id="professional-summary-error"
          message={fieldErrors.professionalSummary}
        />
      </section>

      <section className="cc-card p-6">
        <SectionHeader
          title="Experience"
          onAdd={() => setExperience((items) => [...items, emptyExperience()])}
        />
        <div className="mt-5 space-y-5">
          {experience.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-line bg-canvas p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Job title"
                  value={item.jobTitle}
                  onChange={(value) =>
                    updateExperience(index, {
                      jobTitle: optionalFieldValue(value),
                    })
                  }
                />
                <TextField
                  label="Company"
                  value={item.company}
                  onChange={(value) =>
                    updateExperience(index, {
                      company: optionalFieldValue(value),
                    })
                  }
                />
                <TextField
                  label="Location"
                  value={item.location}
                  onChange={(value) =>
                    updateExperience(index, {
                      location: optionalFieldValue(value),
                    })
                  }
                />
                <TextField
                  label="Start date"
                  id={`experience-${index}-startDate`}
                  fieldKey={`experience.${index}.startDate`}
                  value={item.startDate}
                  error={fieldErrors[`experience.${index}.startDate`]}
                  onChange={(value) => {
                    clearFieldError(`experience.${index}.startDate`);
                    updateExperience(index, {
                      startDate: optionalFieldValue(value),
                    });
                  }}
                />
                <TextField
                  label="End date"
                  id={`experience-${index}-endDate`}
                  fieldKey={`experience.${index}.endDate`}
                  value={item.endDate}
                  error={fieldErrors[`experience.${index}.endDate`]}
                  onChange={(value) => {
                    clearFieldError(`experience.${index}.endDate`);
                    updateExperience(index, {
                      endDate: optionalFieldValue(value),
                    });
                  }}
                />
                <label className="flex items-center gap-2 self-end py-2 text-sm font-medium text-ink">
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
              <label className="mt-4 block text-sm font-medium text-ink">
                Description
                <textarea
                  value={item.description ?? ""}
                  onChange={(event) =>
                    updateExperience(index, {
                      description: optionalFieldValue(event.target.value),
                    })
                  }
                  rows={4}
                  className={fieldClassName}
                />
              </label>
              <CollectionActions
                index={index}
                total={experience.length}
                label="experience"
                onMove={(offset) =>
                  setExperience((items) => moveItem(items, index, offset))
                }
                onRemove={
                  experience.length > 1
                    ? () =>
                        setExperience((items) =>
                          items.filter((_, itemIndex) => itemIndex !== index),
                        )
                    : undefined
                }
                removeLabel="Remove experience"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="cc-card p-6">
        <SectionHeader
          title="Education"
          onAdd={() => setEducation((items) => [...items, emptyEducation()])}
        />
        <div className="mt-5 space-y-5">
          {education.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-line bg-canvas p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Institution"
                  value={item.institution}
                  onChange={(value) =>
                    updateEducation(index, {
                      institution: optionalFieldValue(value),
                    })
                  }
                />
                <TextField
                  label="Degree"
                  value={item.degree}
                  onChange={(value) =>
                    updateEducation(index, {
                      degree: optionalFieldValue(value),
                    })
                  }
                />
                <TextField
                  label="Field of study"
                  value={item.fieldOfStudy}
                  onChange={(value) =>
                    updateEducation(index, {
                      fieldOfStudy: optionalFieldValue(value),
                    })
                  }
                />
                <TextField
                  label="Start date"
                  id={`education-${index}-startDate`}
                  fieldKey={`education.${index}.startDate`}
                  value={item.startDate}
                  error={fieldErrors[`education.${index}.startDate`]}
                  onChange={(value) => {
                    clearFieldError(`education.${index}.startDate`);
                    updateEducation(index, {
                      startDate: optionalFieldValue(value),
                    });
                  }}
                />
                <TextField
                  label="End date"
                  id={`education-${index}-endDate`}
                  fieldKey={`education.${index}.endDate`}
                  value={item.endDate}
                  error={fieldErrors[`education.${index}.endDate`]}
                  onChange={(value) => {
                    clearFieldError(`education.${index}.endDate`);
                    updateEducation(index, {
                      endDate: optionalFieldValue(value),
                    });
                  }}
                />
              </div>
              <label className="mt-4 block text-sm font-medium text-ink">
                Description
                <textarea
                  value={item.description ?? ""}
                  onChange={(event) =>
                    updateEducation(index, {
                      description: optionalFieldValue(event.target.value),
                    })
                  }
                  rows={3}
                  className={fieldClassName}
                />
              </label>
              <CollectionActions
                index={index}
                total={education.length}
                label="education"
                onMove={(offset) =>
                  setEducation((items) => moveItem(items, index, offset))
                }
                onRemove={() =>
                  setEducation((items) =>
                    items.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                removeLabel="Remove education"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="cc-card p-6">
        <SectionHeader
          title="Personal projects"
          onAdd={() =>
            setPersonalProjects((items) => [...items, emptyPersonalProject()])
          }
        />
        <div className="mt-5 space-y-5">
          {personalProjects.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-line bg-canvas p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Project name"
                  value={item.name}
                  onChange={(value) =>
                    updatePersonalProject(index, {
                      name: optionalFieldValue(value),
                    })
                  }
                />
                <TextField
                  label="Project URL"
                  id={`personal-project-${index}-url`}
                  fieldKey={`personalProjects.${index}.url`}
                  value={item.url}
                  error={fieldErrors[`personalProjects.${index}.url`]}
                  onChange={(value) => {
                    clearFieldError(`personalProjects.${index}.url`);
                    updatePersonalProject(index, {
                      url: optionalFieldValue(value),
                    });
                  }}
                />
              </div>
              <label className="mt-4 block text-sm font-medium text-ink">
                Brief description
                <textarea
                  value={item.description ?? ""}
                  onChange={(event) =>
                    updatePersonalProject(index, {
                      description: optionalFieldValue(event.target.value),
                    })
                  }
                  rows={3}
                  className={fieldClassName}
                />
              </label>
              <div className="mt-4">
                <TextField
                  label="Technologies"
                  value={item.technologies}
                  onChange={(value) =>
                    updatePersonalProject(index, {
                      technologies: optionalFieldValue(value),
                    })
                  }
                />
              </div>
              <CollectionActions
                index={index}
                total={personalProjects.length}
                label="personal project"
                onMove={(offset) =>
                  setPersonalProjects((items) => moveItem(items, index, offset))
                }
                onRemove={() =>
                  setPersonalProjects((items) =>
                    items.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                removeLabel="Remove project"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="cc-card p-6">
        <SectionHeader title="Skills" />
        <label className="mt-5 block text-sm font-medium text-ink">
          Skills, separated by commas <span className="text-danger"> *</span>
          <input
            id="skills"
            data-field="skills"
            value={skills}
            onChange={(event) => {
              clearFieldError("skills");
              setSkills(event.target.value);
            }}
            required
            aria-invalid={Boolean(fieldErrors.skills)}
            aria-describedby={fieldErrors.skills ? "skills-error" : undefined}
            className={fieldClassName}
          />
          <FieldError id="skills-error" message={fieldErrors.skills} />
        </label>
      </section>

      <section className="cc-card p-6">
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
              className="grid gap-3 rounded-lg border border-line bg-canvas p-4 sm:grid-cols-[1fr_1fr_auto]"
            >
              <TextField
                label="Language"
                value={item.name}
                onChange={(value) =>
                  updateLanguage(index, {
                    name: optionalFieldValue(value),
                  })
                }
              />
              <TextField
                label="Proficiency"
                value={item.proficiency}
                onChange={(value) =>
                  updateLanguage(index, {
                    proficiency: optionalFieldValue(value),
                  })
                }
              />
              <button
                type="button"
                onClick={() =>
                  setLanguages((items) =>
                    items.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="self-end py-2 text-sm font-semibold text-danger"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="cc-card p-6">
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
              className="rounded-lg border border-line bg-canvas p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Certification"
                  value={item.name}
                  onChange={(value) =>
                    updateCertification(index, {
                      name: optionalFieldValue(value),
                    })
                  }
                />
                <TextField
                  label="Issuer"
                  value={item.issuer}
                  onChange={(value) =>
                    updateCertification(index, {
                      issuer: optionalFieldValue(value),
                    })
                  }
                />
                <TextField
                  label="Issue date"
                  id={`certification-${index}-issueDate`}
                  fieldKey={`certifications.${index}.issueDate`}
                  value={item.issueDate}
                  error={fieldErrors[`certifications.${index}.issueDate`]}
                  onChange={(value) => {
                    clearFieldError(`certifications.${index}.issueDate`);
                    updateCertification(index, {
                      issueDate: optionalFieldValue(value),
                    });
                  }}
                />
                <TextField
                  label="Credential URL"
                  id={`certification-${index}-credentialUrl`}
                  fieldKey={`certifications.${index}.credentialUrl`}
                  value={item.credentialUrl}
                  error={fieldErrors[`certifications.${index}.credentialUrl`]}
                  onChange={(value) => {
                    clearFieldError(`certifications.${index}.credentialUrl`);
                    updateCertification(index, {
                      credentialUrl: optionalFieldValue(value),
                    });
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setCertifications((items) =>
                    items.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="mt-3 text-sm font-semibold text-danger"
              >
                Remove certification
              </button>
            </div>
          ))}
        </div>
      </section>

      {errorMessage ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSaving}
        className="cc-btn-primary px-5 py-3"
      >
        {isSaving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
