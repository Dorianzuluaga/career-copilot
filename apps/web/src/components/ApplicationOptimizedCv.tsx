import { useState, type ReactNode } from "react";
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
} from "../types/master-cv";
import type { OptimizedCv } from "../types/optimized-cv";

interface ApplicationOptimizedCvProps {
  errorMessage: string | null;
  initialIsEditing?: boolean;
  isLoading: boolean;
  isSaving?: boolean;
  onChange: (optimizedCv: OptimizedCv) => void;
  onContinueToCoverLetter?: () => void;
  onGenerate: () => void;
  onSave?: () => void;
  optimizedCv: OptimizedCv | null;
  saveErrorMessage?: string | null;
  savedMessage?: string | null;
}

const fieldClassName =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
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
}: {
  title: string;
  children: ReactNode;
  editable?: boolean;
}) {
  return (
    <section className="border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </h3>
        {editable ? (
          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
            Editable
          </span>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ReadOnlyValue({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      {children}
    </div>
  );
}

function PersonalInformationSection({
  cv,
  isEditing,
}: {
  cv: OptimizedCv;
  isEditing: boolean;
}) {
  const contactDetails = [
    cv.email,
    cv.phone,
    cv.location,
    cv.linkedin,
    cv.portfolio,
  ].filter(hasText);

  const content = (
    <>
      <p className="text-2xl font-bold tracking-tight text-slate-950">
        {cv.fullName}
      </p>
      {contactDetails.length > 0 ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {contactDetails.join(" · ")}
        </p>
      ) : null}
    </>
  );

  return (
    <DocumentSection title="Personal information">
      {isEditing ? <ReadOnlyValue>{content}</ReadOnlyValue> : content}
    </DocumentSection>
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
              <h4 className="text-base font-semibold text-slate-950">
                {titleParts.join(" · ")}
              </h4>
            ) : null}
            {metaParts.length > 0 ? (
              <p
                className={
                  titleParts.length > 0
                    ? "mt-1 text-sm text-slate-500"
                    : "text-sm text-slate-500"
                }
              >
                {metaParts.join(" · ")}
              </p>
            ) : null}
          </>
        );
        const hasIdentity = titleParts.length > 0 || metaParts.length > 0;

        return (
          <article key={index}>
            {hasIdentity ? (
              isEditing ? (
                <ReadOnlyValue>{identity}</ReadOnlyValue>
              ) : (
                identity
              )
            ) : null}

            {isEditing && onDescriptionChange ? (
              <label className="mt-3 block text-sm font-medium text-slate-700">
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
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
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
    <div className="space-y-5">
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
              <h4 className="text-base font-semibold text-slate-950">
                {title}
              </h4>
            ) : null}
            {metaParts.length > 0 ? (
              <p className="mt-1 text-sm text-slate-500">
                {metaParts.join(" · ")}
              </p>
            ) : null}
            {hasText(item.description) ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {item.description}
              </p>
            ) : null}
          </>
        );

        return (
          <article key={index}>
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
    <ul className="space-y-2 text-sm leading-6 text-slate-700">
      {items.map((item, index) => {
        const label = [item.name, item.proficiency].filter(hasText).join(" — ");
        if (!label) {
          return null;
        }

        return (
          <li key={index} className="flex gap-2">
            <span aria-hidden="true" className="text-slate-400">
              •
            </span>
            <span>{label}</span>
          </li>
        );
      })}
    </ul>
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
              <h4 className="text-base font-semibold text-slate-950">
                {title}
              </h4>
            ) : null}
            {metaParts.length > 0 ? (
              <p className="mt-1 text-sm text-slate-500">
                {metaParts.join(" · ")}
              </p>
            ) : null}
            {hasText(item.credentialUrl) ? (
              <p className="mt-1 text-sm text-slate-600">
                {item.credentialUrl}
              </p>
            ) : null}
          </>
        );

        return (
          <article key={index}>
            {isEditing ? <ReadOnlyValue>{content}</ReadOnlyValue> : content}
          </article>
        );
      })}
    </div>
  );
}

function SkillsSection({
  skills,
  isEditing,
  onAddSkill,
  onRemoveSkill,
}: {
  skills: string[];
  isEditing: boolean;
  onAddSkill?: (skill: string) => void;
  onRemoveSkill?: (index: number) => void;
}) {
  const [newSkill, setNewSkill] = useState("");
  const visibleSkills = skills.filter(hasText);

  if (!isEditing) {
    return (
      <ul className="space-y-2 text-sm leading-6 text-slate-700">
        {visibleSkills.map((skill) => (
          <li key={skill} className="flex gap-2">
            <span aria-hidden="true" className="text-slate-400">
              •
            </span>
            <span>{skill}</span>
          </li>
        ))}
      </ul>
    );
  }

  function handleAdd() {
    if (!onAddSkill) return;
    const trimmed = newSkill.trim();
    if (!trimmed) return;
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
              className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              <span className="flex-1 text-sm text-slate-950">{skill}</span>
              <button
                type="button"
                onClick={() => onRemoveSkill?.(index)}
                className="text-sm font-semibold text-red-700 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No skills yet.</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="block flex-1 text-sm font-medium text-slate-700">
          <span className="sr-only">New skill</span>
          <input
            type="text"
            value={newSkill}
            onChange={(event) => setNewSkill(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Add a skill"
            aria-label="New skill"
            className={fieldClassName}
          />
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:self-end"
        >
          Add skill
        </button>
      </div>
    </div>
  );
}

function OptimizedCvDocument({
  cv,
  isEditing,
  onChange,
}: {
  cv: OptimizedCv;
  isEditing: boolean;
  onChange: (optimizedCv: OptimizedCv) => void;
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

  return (
    <article
      aria-label="Optimized CV"
      className="rounded-xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10"
    >
      <div className="space-y-8">
        <PersonalInformationSection cv={cv} isEditing={isEditing} />

        {showProfessionalSummary ? (
          <DocumentSection title="Professional summary" editable={isEditing}>
            {isEditing ? (
              <label className="block text-sm font-medium text-slate-700">
                <span className="sr-only">Professional summary</span>
                <textarea
                  value={cv.professionalSummary}
                  onChange={(event) =>
                    onChange({
                      ...cv,
                      professionalSummary: event.target.value,
                    })
                  }
                  rows={6}
                  aria-label="Professional summary"
                  className={`${fieldClassName} min-h-36 resize-y`}
                />
              </label>
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {cv.professionalSummary}
              </p>
            )}
          </DocumentSection>
        ) : null}

        {showExperience ? (
          <DocumentSection title="Experience" editable={isEditing}>
            <ExperienceEntries
              items={cv.experience}
              isEditing={isEditing}
              onDescriptionChange={
                isEditing
                  ? (index, description) =>
                      onChange({
                        ...cv,
                        experience: cv.experience.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, description: description || null }
                            : item,
                        ),
                      })
                  : undefined
              }
            />
          </DocumentSection>
        ) : null}

        {showEducation ? (
          <DocumentSection title="Education">
            <EducationEntries items={cv.education} isEditing={isEditing} />
          </DocumentSection>
        ) : null}

        {showSkills ? (
          <DocumentSection title="Skills" editable={isEditing}>
            <SkillsSection
              skills={cv.skills}
              isEditing={isEditing}
              onAddSkill={
                isEditing
                  ? (skill) =>
                      onChange({
                        ...cv,
                        skills: [...cv.skills, skill],
                      })
                  : undefined
              }
              onRemoveSkill={
                isEditing
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
          <DocumentSection title="Languages">
            <LanguageEntries items={cv.languages} isEditing={isEditing} />
          </DocumentSection>
        ) : null}

        {showCertifications ? (
          <DocumentSection title="Certifications">
            <CertificationEntries
              items={cv.certifications}
              isEditing={isEditing}
            />
          </DocumentSection>
        ) : null}
      </div>
    </article>
  );
}

export function ApplicationOptimizedCv({
  errorMessage,
  initialIsEditing = false,
  isLoading,
  isSaving = false,
  onChange,
  onContinueToCoverLetter,
  onGenerate,
  onSave,
  optimizedCv,
  saveErrorMessage = null,
  savedMessage = null,
}: ApplicationOptimizedCvProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);

  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Optimized CV</h2>
        <p className="mt-2 text-sm text-slate-600">
          Generating your Optimized CV…
        </p>
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
            <p className="text-sm font-semibold text-blue-700">
              Application document
            </p>
            <h2
              id="optimized-cv-title"
              className="mt-1 text-2xl font-bold text-slate-950"
            >
              Optimized CV
            </h2>
            {isEditing ? (
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Edit application-specific content only. Personal information,
                employment dates, company names, job titles, education,
                languages, and certifications remain read-only.
              </p>
            ) : (
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
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
            {onContinueToCoverLetter ? (
              <button
                type="button"
                onClick={onContinueToCoverLetter}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continue to Cover Letter
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

        <OptimizedCvDocument
          cv={optimizedCv}
          isEditing={isEditing}
          onChange={onChange}
        />
      </div>
    );
  }

  return (
    <section
      aria-labelledby="optimized-cv-title"
      className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8"
    >
      <p className="text-sm font-semibold text-blue-700">
        Application document
      </p>
      <h2
        id="optimized-cv-title"
        className="mt-1 text-2xl font-bold text-slate-950"
      >
        Optimized CV
      </h2>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        {errorMessage ??
          "Generate an Optimized CV tailored to this job opportunity from your Master CV, Job Analysis, and Profile Match."}
      </p>
      <button
        type="button"
        onClick={onGenerate}
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {errorMessage ? "Try again" : "Generate Optimized CV"}
      </button>
    </section>
  );
}
