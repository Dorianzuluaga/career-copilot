import { useState, type ReactNode } from "react";
import { ValidationToast } from "./ValidationToast";
import { useSaveValidationFeedback } from "../hooks/useSaveValidationFeedback";
import {
  getMasterCvFieldErrors,
  type FieldErrors,
} from "../lib/field-validation";
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  PersonalProjectItem,
} from "../types/master-cv";
import type { OptimizedCv } from "../types/optimized-cv";

interface ApplicationOptimizedCvProps {
  errorMessage: string | null;
  initialIsEditing?: boolean;
  isLoading: boolean;
  isSaving?: boolean;
  masterCvPersonalProjects?: PersonalProjectItem[];
  onChange: (optimizedCv: OptimizedCv) => void;
  onContinueToCoverLetter?: () => void;
  onGenerate: () => void;
  onSave?: () => void;
  optimizedCv: OptimizedCv | null;
  saveErrorMessage?: string | null;
  savedMessage?: string | null;
}

const fieldClassName = "cc-field mt-1";

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function personalProjectKey(project: PersonalProjectItem): string | null {
  const name = project.name?.trim();
  return name ? name.toLocaleLowerCase() : null;
}

export function availableMasterPersonalProjects(
  masterProjects: PersonalProjectItem[],
  selectedProjects: PersonalProjectItem[],
): PersonalProjectItem[] {
  const selectedKeys = new Set(
    selectedProjects.flatMap((project) => {
      const key = personalProjectKey(project);
      return key ? [key] : [];
    }),
  );

  return masterProjects.filter((project) => {
    const key = personalProjectKey(project);
    return key !== null && !selectedKeys.has(key);
  });
}

export function personalProjectFromMasterCv(
  project: PersonalProjectItem,
): PersonalProjectItem {
  return {
    name: project.name,
    description: project.description,
    technologies: project.technologies,
    url: project.url,
  };
}

function formatDateRange(
  startDate: string | null,
  endDate: string | null,
  current: boolean | null,
): string | null {
  const start = hasText(startDate) ? startDate.trim() : null;
  const end = current ? "Present" : hasText(endDate) ? endDate.trim() : null;

  if (start && end) {
    return `${start} – ${end}`;
  }

  return start ?? end;
}

function DocumentSection({
  title,
  children,
  editable,
  first,
}: {
  title: string;
  children: ReactNode;
  editable?: boolean;
  first?: boolean;
}) {
  return (
    <section className={first ? "" : "border-t border-line pt-5"}>
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          {title}
        </h3>
        {editable ? (
          <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
            Editable
          </span>
        ) : null}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function ReadOnlyValue({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-canvas px-3 py-2">
      {children}
    </div>
  );
}

function DocumentHeader({
  cv,
  isEditing,
}: {
  cv: OptimizedCv;
  isEditing: boolean;
}) {
  const contactItems = [
    { key: "email", value: cv.email },
    { key: "phone", value: cv.phone },
    { key: "location", value: cv.location },
    { key: "linkedin", value: cv.linkedin },
    { key: "portfolio", value: cv.portfolio },
  ].filter((item) => hasText(item.value));

  const content = (
    <>
      <p
        className="text-2xl font-bold tracking-tight text-ink"
        data-field="fullName"
        tabIndex={-1}
      >
        {cv.fullName}
      </p>
      {contactItems.length > 0 ? (
        <p className="mt-2 text-sm leading-6 text-muted">
          {contactItems.map((item, index) => (
            <span key={item.key}>
              {index > 0 ? " · " : null}
              <span data-field={item.key} tabIndex={-1}>
                {item.value}
              </span>
            </span>
          ))}
        </p>
      ) : null}
    </>
  );

  return (
    <header>
      {isEditing ? <ReadOnlyValue>{content}</ReadOnlyValue> : content}
    </header>
  );
}

function ExperienceEntries({
  items,
  isEditing,
  onDescriptionChange,
}: {
  items: ExperienceItem[];
  isEditing: boolean;
  onDescriptionChange?: (index: number, description: string) => void;
}) {
  return (
    <div className="space-y-5">
      {items.map((item, index) => {
        const titleParts = [item.jobTitle, item.company].filter(hasText);
        const metaParts = [
          formatDateRange(item.startDate, item.endDate, item.current),
          item.location,
        ].filter(hasText);

        const identity = (
          <>
            {titleParts.length > 0 ? (
              <h4 className="text-base font-semibold text-ink">
                {titleParts.join(" · ")}
              </h4>
            ) : null}
            {metaParts.length > 0 ? (
              <p
                className={
                  titleParts.length > 0
                    ? "mt-1 text-sm text-muted"
                    : "text-sm text-muted"
                }
              >
                {metaParts.join(" · ")}
              </p>
            ) : null}
          </>
        );
        const hasIdentity = titleParts.length > 0 || metaParts.length > 0;

        return (
          <article
            key={index}
            data-field-group={`experience.${index}`}
            tabIndex={-1}
          >
            {hasIdentity ? (
              isEditing ? (
                <ReadOnlyValue>{identity}</ReadOnlyValue>
              ) : (
                identity
              )
            ) : null}

            {isEditing && onDescriptionChange ? (
              <label className="mt-3 block text-sm font-medium text-ink">
                Description
                <textarea
                  value={item.description ?? ""}
                  onChange={(event) =>
                    onDescriptionChange(index, event.target.value)
                  }
                  rows={5}
                  aria-label={`Experience description ${index + 1}`}
                  className={`${fieldClassName} min-h-28 resize-y`}
                />
              </label>
            ) : hasText(item.description) ? (
              <p className="mt-2 whitespace-pre-wrap text-left text-sm leading-6 text-ink">
                {item.description}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function EducationEntries({
  items,
  isEditing,
}: {
  items: EducationItem[];
  isEditing: boolean;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const title =
          [item.degree, item.fieldOfStudy].filter(hasText).join(" · ") ||
          (hasText(item.institution) ? item.institution : null);
        const metaParts = [
          title !== item.institution ? item.institution : null,
          formatDateRange(item.startDate, item.endDate, null),
        ].filter(hasText);

        const content = (
          <>
            {title ? (
              <h4 className="text-base font-semibold text-ink">{title}</h4>
            ) : null}
            {metaParts.length > 0 ? (
              <p className="mt-1 text-sm text-muted">{metaParts.join(" · ")}</p>
            ) : null}
            {hasText(item.description) ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">
                {item.description}
              </p>
            ) : null}
          </>
        );

        return (
          <article
            key={index}
            data-field-group={`education.${index}`}
            tabIndex={-1}
          >
            {isEditing ? <ReadOnlyValue>{content}</ReadOnlyValue> : content}
          </article>
        );
      })}
    </div>
  );
}

function LanguageEntries({
  items,
  isEditing,
}: {
  items: LanguageItem[];
  isEditing: boolean;
}) {
  const list = (
    <div className="space-y-1 text-left text-sm leading-6 text-ink">
      {items.map((item, index) => {
        const label = [item.name, item.proficiency].filter(hasText).join(" · ");
        if (!label) {
          return null;
        }

        return <p key={index}>{label}</p>;
      })}
    </div>
  );

  return isEditing ? <ReadOnlyValue>{list}</ReadOnlyValue> : list;
}

function CertificationEntries({
  items,
  isEditing,
}: {
  items: CertificationItem[];
  isEditing: boolean;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const title = hasText(item.name) ? item.name : null;
        const metaParts = [item.issuer, item.issueDate].filter(hasText);

        if (!title && metaParts.length === 0 && !hasText(item.credentialUrl)) {
          return null;
        }

        const content = (
          <>
            {title ? (
              <h4 className="text-base font-semibold text-ink">{title}</h4>
            ) : null}
            {metaParts.length > 0 ? (
              <p className="mt-1 text-sm text-muted">{metaParts.join(" · ")}</p>
            ) : null}
            {hasText(item.credentialUrl) ? (
              <p className="mt-1 text-sm text-muted">{item.credentialUrl}</p>
            ) : null}
          </>
        );

        return (
          <article
            key={index}
            data-field-group={`certifications.${index}`}
            tabIndex={-1}
          >
            {isEditing ? <ReadOnlyValue>{content}</ReadOnlyValue> : content}
          </article>
        );
      })}
    </div>
  );
}

function AddPersonalProjectControls({
  availableProjects,
  onAdd,
}: {
  availableProjects: PersonalProjectItem[];
  onAdd: (project: PersonalProjectItem) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  if (availableProjects.length === 0) return null;

  const selectedProject =
    availableProjects[selectedIndex] ?? availableProjects[0];

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <label className="block flex-1 text-sm font-medium text-ink">
        <span className="sr-only">Add a Personal Project</span>
        <select
          value={String(Math.min(selectedIndex, availableProjects.length - 1))}
          onChange={(event) => setSelectedIndex(Number(event.target.value))}
          aria-label="Add a Personal Project"
          className={fieldClassName}
        >
          {availableProjects.map((project, index) => (
            <option
              key={`${personalProjectKey(project)}-${index}`}
              value={index}
            >
              {project.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => onAdd(personalProjectFromMasterCv(selectedProject))}
        className="cc-btn-secondary px-4 py-2 sm:self-end"
      >
        Add project
      </button>
    </div>
  );
}

function PersonalProjectEntries({
  items,
  isEditing,
  onDescriptionChange,
  onRemove,
}: {
  items: PersonalProjectItem[];
  isEditing: boolean;
  onDescriptionChange?: (index: number, description: string) => void;
  onRemove?: (index: number) => void;
}) {
  return (
    <div className="space-y-5">
      {items.map((item, index) => {
        const title = hasText(item.name) ? item.name : null;
        const metaParts = [item.technologies, item.url].filter(hasText);
        const identity = (
          <>
            {title ? (
              <h4 className="text-base font-semibold text-ink">{title}</h4>
            ) : null}
            {metaParts.length > 0 ? (
              <p
                className={
                  title ? "mt-1 text-sm text-muted" : "text-sm text-muted"
                }
              >
                {metaParts.join(" · ")}
              </p>
            ) : null}
          </>
        );
        const hasIdentity = Boolean(title) || metaParts.length > 0;

        return (
          <article
            key={index}
            data-field-group={`personalProjects.${index}`}
            tabIndex={-1}
          >
            {hasIdentity ? (
              isEditing ? (
                <ReadOnlyValue>{identity}</ReadOnlyValue>
              ) : (
                identity
              )
            ) : null}

            {isEditing && onDescriptionChange ? (
              <label className="mt-3 block text-sm font-medium text-ink">
                Description
                <textarea
                  value={item.description ?? ""}
                  onChange={(event) =>
                    onDescriptionChange(index, event.target.value)
                  }
                  rows={4}
                  aria-label={`Personal project description ${index + 1}`}
                  className={`${fieldClassName} min-h-24 resize-y`}
                />
              </label>
            ) : hasText(item.description) ? (
              <p className="mt-2 whitespace-pre-wrap text-left text-sm leading-6 text-ink">
                {item.description}
              </p>
            ) : null}

            {isEditing && onRemove ? (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="mt-3 text-sm font-semibold text-danger hover:text-danger"
              >
                Remove project
              </button>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function SkillsSection({
  skills,
  isEditing,
  error,
  onAddSkill,
  onRemoveSkill,
}: {
  skills: string[];
  isEditing: boolean;
  error?: string;
  onAddSkill?: (skill: string) => void;
  onRemoveSkill?: (index: number) => void;
}) {
  const [newSkill, setNewSkill] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const visibleSkills = skills.filter(hasText);

  if (!isEditing) {
    return (
      <p className="text-left text-sm leading-6 text-ink">
        {visibleSkills.join(" · ")}
      </p>
    );
  }

  function handleAdd() {
    if (!onAddSkill) return;
    const trimmed = newSkill.trim();
    if (!trimmed) {
      setAddError("Enter a skill.");
      return;
    }
    setAddError(null);
    onAddSkill(trimmed);
    setNewSkill("");
  }

  return (
    <div className="space-y-3">
      {skills.length > 0 ? (
        <ul className="space-y-2">
          {skills.map((skill, index) => (
            <li
              key={`${skill}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2"
            >
              <span className="flex-1 text-sm text-ink">{skill}</span>
              <button
                type="button"
                onClick={() => onRemoveSkill?.(index)}
                className="text-sm font-semibold text-danger hover:text-danger"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No skills yet.</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="block flex-1 text-sm font-medium text-ink">
          <span className="sr-only">New skill</span>
          <input
            type="text"
            data-field="skills"
            value={newSkill}
            onChange={(event) => {
              setAddError(null);
              setNewSkill(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Add a skill"
            aria-label="New skill"
            aria-invalid={Boolean(addError)}
            aria-describedby={addError ? "new-skill-error" : undefined}
            className={fieldClassName}
          />
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="cc-btn-secondary px-4 py-2 sm:self-end"
        >
          Add skill
        </button>
      </div>
      {addError ? (
        <p id="new-skill-error" className="text-sm font-medium text-danger">
          {addError}
        </p>
      ) : error ? (
        <p id="skills-error" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function OptimizedCvDocument({
  cv,
  isEditing = false,
  masterCvPersonalProjects = [],
  fieldErrors = {},
  onChange,
}: {
  cv: OptimizedCv;
  isEditing?: boolean;
  masterCvPersonalProjects?: PersonalProjectItem[];
  fieldErrors?: FieldErrors;
  onChange?: (optimizedCv: OptimizedCv) => void;
}) {
  const showProfessionalSummary = isEditing || hasText(cv.professionalSummary);
  const showExperience = cv.experience.length > 0;
  const showEducation = cv.education.length > 0;
  const showSkills = isEditing || cv.skills.some(hasText);
  const showLanguages = cv.languages.some(
    (item) => hasText(item.name) || hasText(item.proficiency),
  );
  const showCertifications = cv.certifications.some(
    (item) =>
      hasText(item.name) ||
      hasText(item.issuer) ||
      hasText(item.issueDate) ||
      hasText(item.credentialUrl),
  );
  const personalProjects = cv.personalProjects ?? [];
  const availableProjects = isEditing
    ? availableMasterPersonalProjects(
        masterCvPersonalProjects,
        personalProjects,
      )
    : [];
  const showPersonalProjects =
    personalProjects.length > 0 || availableProjects.length > 0;
  const showLeft = showProfessionalSummary || showExperience;
  const showRight =
    showEducation || showSkills || showLanguages || showCertifications;
  const leftFirst = showProfessionalSummary ? "summary" : "experience";
  const rightFirst = showEducation
    ? "education"
    : showSkills
      ? "skills"
      : showLanguages
        ? "languages"
        : "certifications";

  return (
    <article
      aria-label="Optimized CV"
      className="cc-card px-6 py-8 sm:px-10 sm:py-10"
    >
      <DocumentHeader cv={cv} isEditing={isEditing} />

      {showLeft || showRight ? (
        <div className="mt-6 grid grid-cols-[minmax(0,68fr)_minmax(0,32fr)] items-start gap-x-8 gap-y-6">
          {showLeft ? (
            <div className="space-y-5">
              {showProfessionalSummary ? (
                <DocumentSection
                  title="Professional summary"
                  editable={isEditing}
                  first={leftFirst === "summary"}
                >
                  {isEditing && onChange ? (
                    <label className="block text-sm font-medium text-ink">
                      <span className="sr-only">Professional summary</span>
                      <textarea
                        id="professional-summary"
                        data-field="professionalSummary"
                        value={cv.professionalSummary}
                        onChange={(event) =>
                          onChange({
                            ...cv,
                            professionalSummary: event.target.value,
                          })
                        }
                        rows={6}
                        aria-label="Professional summary"
                        aria-invalid={Boolean(fieldErrors.professionalSummary)}
                        aria-describedby={
                          fieldErrors.professionalSummary
                            ? "professional-summary-error"
                            : undefined
                        }
                        className={`${fieldClassName} min-h-36 resize-y`}
                      />
                      {fieldErrors.professionalSummary ? (
                        <p
                          id="professional-summary-error"
                          className="mt-1 text-sm font-medium text-danger"
                        >
                          {fieldErrors.professionalSummary}
                        </p>
                      ) : null}
                    </label>
                  ) : (
                    <p className="whitespace-pre-wrap text-justify text-sm leading-7 text-ink">
                      {cv.professionalSummary}
                    </p>
                  )}
                </DocumentSection>
              ) : null}

              {showExperience ? (
                <DocumentSection
                  title="Experience"
                  editable={isEditing}
                  first={leftFirst === "experience"}
                >
                  <ExperienceEntries
                    items={cv.experience}
                    isEditing={isEditing}
                    onDescriptionChange={
                      isEditing && onChange
                        ? (index, description) =>
                            onChange({
                              ...cv,
                              experience: cv.experience.map(
                                (item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        description: description || null,
                                      }
                                    : item,
                              ),
                            })
                        : undefined
                    }
                  />
                </DocumentSection>
              ) : null}
            </div>
          ) : (
            <div />
          )}

          {showRight ? (
            <aside className="space-y-5">
              {showEducation ? (
                <DocumentSection
                  title="Education"
                  first={rightFirst === "education"}
                >
                  <EducationEntries
                    items={cv.education}
                    isEditing={isEditing}
                  />
                </DocumentSection>
              ) : null}

              {showSkills ? (
                <DocumentSection
                  title="Skills"
                  editable={isEditing}
                  first={rightFirst === "skills"}
                >
                  <SkillsSection
                    skills={cv.skills}
                    isEditing={isEditing}
                    error={fieldErrors.skills}
                    onAddSkill={
                      isEditing && onChange
                        ? (skill) =>
                            onChange({
                              ...cv,
                              skills: [...cv.skills, skill],
                            })
                        : undefined
                    }
                    onRemoveSkill={
                      isEditing && onChange
                        ? (index) =>
                            onChange({
                              ...cv,
                              skills: cv.skills.filter(
                                (_, skillIndex) => skillIndex !== index,
                              ),
                            })
                        : undefined
                    }
                  />
                </DocumentSection>
              ) : null}

              {showLanguages ? (
                <DocumentSection
                  title="Languages"
                  first={rightFirst === "languages"}
                >
                  <LanguageEntries items={cv.languages} isEditing={isEditing} />
                </DocumentSection>
              ) : null}

              {showCertifications ? (
                <DocumentSection
                  title="Certifications"
                  first={rightFirst === "certifications"}
                >
                  <CertificationEntries
                    items={cv.certifications}
                    isEditing={isEditing}
                  />
                </DocumentSection>
              ) : null}
            </aside>
          ) : null}
        </div>
      ) : null}

      {showPersonalProjects ? (
        <div className={showLeft || showRight ? undefined : "mt-6"}>
          <DocumentSection
            title="Personal projects"
            editable={isEditing}
            first={!showLeft && !showRight}
          >
            <PersonalProjectEntries
              items={personalProjects}
              isEditing={isEditing}
              onDescriptionChange={
                isEditing && onChange
                  ? (index, description) =>
                      onChange({
                        ...cv,
                        personalProjects: personalProjects.map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  description: description || null,
                                }
                              : item,
                        ),
                      })
                  : undefined
              }
              onRemove={
                isEditing && onChange
                  ? (index) =>
                      onChange({
                        ...cv,
                        personalProjects: personalProjects.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      })
                  : undefined
              }
            />
            {isEditing && onChange ? (
              <AddPersonalProjectControls
                availableProjects={availableProjects}
                onAdd={(project) => {
                  if (
                    availableMasterPersonalProjects([project], personalProjects)
                      .length === 0
                  ) {
                    return;
                  }
                  onChange({
                    ...cv,
                    personalProjects: [...personalProjects, project],
                  });
                }}
              />
            ) : null}
          </DocumentSection>
        </div>
      ) : null}
    </article>
  );
}

export function ApplicationOptimizedCv({
  errorMessage,
  initialIsEditing = false,
  isLoading,
  isSaving = false,
  masterCvPersonalProjects = [],
  onChange,
  onContinueToCoverLetter,
  onGenerate,
  onSave,
  optimizedCv,
  saveErrorMessage = null,
  savedMessage = null,
}: ApplicationOptimizedCvProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const { fieldErrors, toastMessage, reportFieldErrors, clearAllFieldErrors } =
    useSaveValidationFeedback();

  function handleChange(next: OptimizedCv) {
    clearAllFieldErrors();
    onChange(next);
  }

  function handleSave() {
    if (!optimizedCv || !onSave) return;
    if (reportFieldErrors(getMasterCvFieldErrors(optimizedCv))) return;
    onSave();
  }

  const readOnlyFieldErrors = Object.entries(fieldErrors).filter(
    ([key]) => key !== "professionalSummary" && key !== "skills",
  );

  if (isLoading) {
    return (
      <section className="cc-card p-8 text-center">
        <h2 className="text-lg font-bold text-ink">Optimized CV</h2>
        <p className="mt-2 text-sm text-muted">Generating your Optimized CV…</p>
      </section>
    );
  }

  if (optimizedCv) {
    return (
      <div className="space-y-6">
        <section
          aria-labelledby="optimized-cv-title"
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <p className="cc-kicker">Application document</p>
            <h2
              id="optimized-cv-title"
              className="mt-1 text-2xl font-bold text-ink"
            >
              Optimized CV
            </h2>
            {isEditing ? (
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Edit application-specific content only. Personal information,
                employment dates, company names, job titles, education,
                languages, certifications, and Personal Project names,
                technologies, and URLs remain read-only.
              </p>
            ) : (
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Review the generated document. Enter Edit mode to update
                application-specific content.
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
                onClick={handleSave}
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
            {onContinueToCoverLetter ? (
              <button
                type="button"
                onClick={onContinueToCoverLetter}
                className="cc-btn-secondary"
              >
                Continue to Cover Letter
              </button>
            ) : null}
          </div>
        </section>

        {savedMessage ? (
          <p role="status" className="text-sm font-medium text-success">
            {savedMessage}
          </p>
        ) : null}
        <ValidationToast message={toastMessage} />
        {saveErrorMessage ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {saveErrorMessage}
          </p>
        ) : null}
        {readOnlyFieldErrors.length > 0 ? (
          <div role="alert" className="space-y-1">
            {readOnlyFieldErrors.map(([key, message]) => (
              <p key={key} className="text-sm font-medium text-danger">
                {message}
              </p>
            ))}
          </div>
        ) : null}

        <OptimizedCvDocument
          cv={optimizedCv}
          isEditing={isEditing}
          masterCvPersonalProjects={masterCvPersonalProjects}
          fieldErrors={fieldErrors}
          onChange={handleChange}
        />
      </div>
    );
  }

  return (
    <section
      aria-labelledby="optimized-cv-title"
      className="cc-card p-6 text-center sm:p-8"
    >
      <p className="cc-kicker">Application document</p>
      <h2 id="optimized-cv-title" className="mt-1 text-2xl font-bold text-ink">
        Optimized CV
      </h2>
      <p className="mt-4 text-sm leading-6 text-muted">
        {errorMessage ??
          "Generate an Optimized CV tailored to this job opportunity from your Master CV, Job Analysis, and Profile Match."}
      </p>
      <button
        type="button"
        onClick={onGenerate}
        className="cc-btn-primary mt-6"
      >
        {errorMessage ? "Try again" : "Generate Optimized CV"}
      </button>
    </section>
  );
}
