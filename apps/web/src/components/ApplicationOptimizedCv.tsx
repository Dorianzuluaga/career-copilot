import { useState, type ReactNode } from "react";
import { ValidationToast } from "./ValidationToast";
import type { LocaleContextValue } from "../context/locale-context";
import { useLocale } from "../hooks/useLocale";
import { useSaveValidationFeedback } from "../hooks/useSaveValidationFeedback";
import type { TranslationKey } from "../i18n/messages";
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

type Translate = LocaleContextValue["t"];

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

const MASTER_CV_VALIDATION_KEYS: Record<string, TranslationKey> = {
  "Full name is required.": "masterCv.validation.fullNameRequired",
  "Email is required.": "masterCv.validation.emailRequired",
  "Enter a valid email address.": "masterCv.validation.emailInvalid",
  "Enter a valid phone number.": "masterCv.validation.phoneInvalid",
  "Enter a valid URL.": "masterCv.validation.urlInvalid",
  "Professional summary is required.":
    "masterCv.validation.professionalSummaryRequired",
  "Enter at least one skill.": "masterCv.validation.skillsRequired",
  "Enter a valid date.": "masterCv.validation.dateInvalid",
};

function translateMasterCvFieldErrors(
  errors: FieldErrors,
  t: Translate,
): FieldErrors {
  return Object.fromEntries(
    Object.entries(errors).map(([key, message]) => {
      const translationKey = MASTER_CV_VALIDATION_KEYS[message];
      return [key, translationKey ? t(translationKey) : message];
    }),
  );
}

function getMasterCvToastFieldLabel(key: string, t: Translate): string {
  const simpleLabels: Record<string, TranslationKey> = {
    fullName: "masterCv.form.fullName",
    email: "masterCv.form.email",
    phone: "masterCv.form.phone",
    linkedin: "masterCv.form.linkedin",
    portfolio: "masterCv.form.portfolio",
    professionalSummary: "masterCv.form.professionalSummary",
    skills: "masterCv.form.skills",
  };
  const simpleLabel = simpleLabels[key];
  if (simpleLabel) return t(simpleLabel);

  const indexed = key.match(
    /^(experience|education|personalProjects|certifications)\.(\d+)\.(.+)$/,
  );
  if (!indexed) return key;

  const collection = indexed[1];
  const position = Number(indexed[2]) + 1;
  const field = indexed[3];

  if (collection === "experience") {
    if (field === "startDate") {
      return t("masterCv.toast.experienceStartDate", { position });
    }
    if (field === "endDate") {
      return t("masterCv.toast.experienceEndDate", { position });
    }
  }
  if (collection === "education") {
    if (field === "startDate") {
      return t("masterCv.toast.educationStartDate", { position });
    }
    if (field === "endDate") {
      return t("masterCv.toast.educationEndDate", { position });
    }
  }
  if (collection === "personalProjects" && field === "url") {
    return t("masterCv.toast.projectUrl", { position });
  }
  if (collection === "certifications") {
    if (field === "issueDate") {
      return t("masterCv.toast.certificationIssueDate", { position });
    }
    if (field === "credentialUrl") {
      return t("masterCv.toast.certificationCredentialUrl", { position });
    }
  }

  return key;
}

function listMasterCvFieldNames(names: string[], t: Translate): string {
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

function getMasterCvToastMessage(
  errors: FieldErrors,
  t: Translate,
): string | null {
  const keys = Object.keys(errors);
  if (keys.length === 0) return null;

  const fields = listMasterCvFieldNames(
    keys.map((key) => getMasterCvToastFieldLabel(key, t)),
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
  presentLabel: string,
): string | null {
  const start = hasText(startDate) ? startDate.trim() : null;
  const end = current ? presentLabel : hasText(endDate) ? endDate.trim() : null;

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
  const { t } = useLocale();
  return (
    <section className={first ? "" : "border-t border-line pt-5"}>
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          {title}
        </h3>
        {editable ? (
          <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
            {t("optimizedCv.editable")}
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
  const { t } = useLocale();
  const presentLabel = t("optimizedCv.present");

  return (
    <div className="space-y-5">
      {items.map((item, index) => {
        const titleParts = [item.jobTitle, item.company].filter(hasText);
        const metaParts = [
          formatDateRange(
            item.startDate,
            item.endDate,
            item.current,
            presentLabel,
          ),
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
                {t("optimizedCv.description")}
                <textarea
                  value={item.description ?? ""}
                  onChange={(event) =>
                    onDescriptionChange(index, event.target.value)
                  }
                  rows={5}
                  aria-label={t("optimizedCv.experienceDescriptionAria", {
                    position: index + 1,
                  })}
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
  const { t } = useLocale();
  const presentLabel = t("optimizedCv.present");

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const title =
          [item.degree, item.fieldOfStudy].filter(hasText).join(" · ") ||
          (hasText(item.institution) ? item.institution : null);
        const metaParts = [
          title !== item.institution ? item.institution : null,
          formatDateRange(item.startDate, item.endDate, null, presentLabel),
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
  const { t } = useLocale();
  const [selectedIndex, setSelectedIndex] = useState(0);
  if (availableProjects.length === 0) return null;

  const selectedProject =
    availableProjects[selectedIndex] ?? availableProjects[0];

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <label className="block flex-1 text-sm font-medium text-ink">
        <span className="sr-only">{t("optimizedCv.addPersonalProject")}</span>
        <select
          value={String(Math.min(selectedIndex, availableProjects.length - 1))}
          onChange={(event) => setSelectedIndex(Number(event.target.value))}
          aria-label={t("optimizedCv.addPersonalProject")}
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
        {t("optimizedCv.addProject")}
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
  const { t } = useLocale();

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
                {t("optimizedCv.description")}
                <textarea
                  value={item.description ?? ""}
                  onChange={(event) =>
                    onDescriptionChange(index, event.target.value)
                  }
                  rows={4}
                  aria-label={t("optimizedCv.personalProjectDescriptionAria", {
                    position: index + 1,
                  })}
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
                {t("optimizedCv.removeProject")}
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
  const { t } = useLocale();
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
      setAddError(t("optimizedCv.enterSkill"));
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
                {t("optimizedCv.removeSkill")}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t("optimizedCv.noSkills")}</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="block flex-1 text-sm font-medium text-ink">
          <span className="sr-only">{t("optimizedCv.newSkill")}</span>
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
            placeholder={t("optimizedCv.addSkillPlaceholder")}
            aria-label={t("optimizedCv.newSkill")}
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
          {t("optimizedCv.addSkill")}
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
  const { t } = useLocale();
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
      aria-label={t("optimizedCv.title")}
      className="cc-card px-6 py-8 sm:px-10 sm:py-10"
    >
      <DocumentHeader cv={cv} isEditing={isEditing} />

      {showLeft || showRight ? (
        <div className="mt-6 grid grid-cols-[minmax(0,68fr)_minmax(0,32fr)] items-start gap-x-8 gap-y-6">
          {showLeft ? (
            <div className="space-y-5">
              {showProfessionalSummary ? (
                <DocumentSection
                  title={t("optimizedCv.professionalSummary")}
                  editable={isEditing}
                  first={leftFirst === "summary"}
                >
                  {isEditing && onChange ? (
                    <label className="block text-sm font-medium text-ink">
                      <span className="sr-only">
                        {t("optimizedCv.professionalSummary")}
                      </span>
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
                        aria-label={t("optimizedCv.professionalSummary")}
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
                  title={t("optimizedCv.experience")}
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
                  title={t("optimizedCv.education")}
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
                  title={t("optimizedCv.skills")}
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
                  title={t("optimizedCv.languages")}
                  first={rightFirst === "languages"}
                >
                  <LanguageEntries items={cv.languages} isEditing={isEditing} />
                </DocumentSection>
              ) : null}

              {showCertifications ? (
                <DocumentSection
                  title={t("optimizedCv.certifications")}
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
            title={t("optimizedCv.personalProjects")}
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
  const { t } = useLocale();
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const { fieldErrors, reportFieldErrors, clearAllFieldErrors } =
    useSaveValidationFeedback();

  function handleChange(next: OptimizedCv) {
    clearAllFieldErrors();
    onChange(next);
  }

  function handleSave() {
    if (!optimizedCv || !onSave) return;
    if (
      reportFieldErrors(
        translateMasterCvFieldErrors(getMasterCvFieldErrors(optimizedCv), t),
      )
    ) {
      return;
    }
    onSave();
  }

  const readOnlyFieldErrors = Object.entries(fieldErrors).filter(
    ([key]) => key !== "professionalSummary" && key !== "skills",
  );

  if (isLoading) {
    return (
      <section className="cc-card p-8 text-center">
        <h2 className="text-lg font-bold text-ink">{t("optimizedCv.title")}</h2>
        <p className="mt-2 text-sm text-muted">{t("optimizedCv.loading")}</p>
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
            <p className="cc-kicker">{t("optimizedCv.kicker")}</p>
            <h2
              id="optimized-cv-title"
              className="mt-1 text-2xl font-bold text-ink"
            >
              {t("optimizedCv.title")}
            </h2>
            {isEditing ? (
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                {t("optimizedCv.editDescription")}
              </p>
            ) : (
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                {t("optimizedCv.reviewDescription")}
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
                {t("optimizedCv.doneEditing")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="cc-btn-primary"
              >
                {t("optimizedCv.edit")}
              </button>
            )}
            {onSave ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="cc-btn-secondary"
              >
                {isSaving ? t("optimizedCv.saving") : t("optimizedCv.save")}
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
              {t("optimizedCv.generateAgain")}
            </button>
            {onContinueToCoverLetter ? (
              <button
                type="button"
                onClick={onContinueToCoverLetter}
                className="cc-btn-secondary"
              >
                {t("optimizedCv.continueToCoverLetter")}
              </button>
            ) : null}
          </div>
        </section>

        {savedMessage ? (
          <p role="status" className="text-sm font-medium text-success">
            {savedMessage}
          </p>
        ) : null}
        <ValidationToast message={getMasterCvToastMessage(fieldErrors, t)} />
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
      <p className="cc-kicker">{t("optimizedCv.kicker")}</p>
      <h2 id="optimized-cv-title" className="mt-1 text-2xl font-bold text-ink">
        {t("optimizedCv.title")}
      </h2>
      <p className="mt-4 text-sm leading-6 text-muted">
        {errorMessage ?? t("optimizedCv.generateDescription")}
      </p>
      <button
        type="button"
        onClick={onGenerate}
        className="cc-btn-primary mt-6"
      >
        {errorMessage ? t("optimizedCv.tryAgain") : t("optimizedCv.generate")}
      </button>
    </section>
  );
}
