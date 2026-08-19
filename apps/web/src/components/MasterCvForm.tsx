import { useState, type FormEvent } from "react";
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
    <label className="block text-sm font-medium text-ink">
      {label}
      {required ? <span className="text-danger"> *</span> : null}
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
    await onSubmit({
      ...personal,
      phone: nullable(personal.phone ?? ""),
      location: nullable(personal.location ?? ""),
      linkedin: nullable(personal.linkedin ?? ""),
      portfolio: nullable(personal.portfolio ?? ""),
      professionalSummary: professionalSummary.trim(),
      experience,
      education,
      personalProjects,
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
      <section className="cc-card p-6">
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

      <section className="cc-card p-6">
        <SectionHeader title="Professional summary" />
        <textarea
          value={professionalSummary}
          onChange={(event) => setProfessionalSummary(event.target.value)}
          required
          rows={6}
          className={fieldClassName}
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
                      description: nullable(event.target.value),
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
              <label className="mt-4 block text-sm font-medium text-ink">
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
                    updatePersonalProject(index, { name: nullable(value) })
                  }
                />
                <TextField
                  label="Project URL"
                  value={item.url}
                  onChange={(value) =>
                    updatePersonalProject(index, { url: nullable(value) })
                  }
                />
              </div>
              <label className="mt-4 block text-sm font-medium text-ink">
                Brief description
                <textarea
                  value={item.description ?? ""}
                  onChange={(event) =>
                    updatePersonalProject(index, {
                      description: nullable(event.target.value),
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
                      technologies: nullable(value),
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
          Skills, separated by commas <span className="text-danger">*</span>
          <input
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            required
            className={fieldClassName}
          />
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
