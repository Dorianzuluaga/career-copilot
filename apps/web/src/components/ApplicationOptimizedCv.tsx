import type { ReactNode } from "react";
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
} from "../types/master-cv";
import type { OptimizedCv } from "../types/optimized-cv";

interface ApplicationOptimizedCvProps {
  errorMessage: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  optimizedCv: OptimizedCv | null;
}

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
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PersonalInformationSection({ cv }: { cv: OptimizedCv }) {
  const contactDetails = [
    cv.email,
    cv.phone,
    cv.location,
    cv.linkedin,
    cv.portfolio,
  ].filter(hasText);

  return (
    <DocumentSection title="Personal information">
      <p className="text-2xl font-bold tracking-tight text-slate-950">
        {cv.fullName}
      </p>
      {contactDetails.length > 0 ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {contactDetails.join(" · ")}
        </p>
      ) : null}
    </DocumentSection>
  );
}

function ExperienceEntries({ items }: { items: ExperienceItem[] }) {
  return (
    <div className="space-y-5">
      {items.map((item, index) => {
        const titleParts = [item.jobTitle, item.company].filter(hasText);
        const metaParts = [
          formatDateRange(item.startDate, item.endDate, item.current),
          item.location,
        ].filter(hasText);

        return (
          <article key={index}>
            {titleParts.length > 0 ? (
              <h4 className="text-base font-semibold text-slate-950">
                {titleParts.join(" · ")}
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
          </article>
        );
      })}
    </div>
  );
}

function EducationEntries({ items }: { items: EducationItem[] }) {
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

        return (
          <article key={index}>
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
          </article>
        );
      })}
    </div>
  );
}

function LanguageEntries({ items }: { items: LanguageItem[] }) {
  return (
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
}

function CertificationEntries({ items }: { items: CertificationItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const title = hasText(item.name) ? item.name : null;
        const metaParts = [item.issuer, item.issueDate].filter(hasText);

        if (!title && metaParts.length === 0 && !hasText(item.credentialUrl)) {
          return null;
        }

        return (
          <article key={index}>
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
          </article>
        );
      })}
    </div>
  );
}

function OptimizedCvDocument({ cv }: { cv: OptimizedCv }) {
  const showProfessionalSummary = hasText(cv.professionalSummary);
  const showExperience = cv.experience.length > 0;
  const showEducation = cv.education.length > 0;
  const showSkills = cv.skills.some(hasText);
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
        <PersonalInformationSection cv={cv} />

        {showProfessionalSummary ? (
          <DocumentSection title="Professional summary">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {cv.professionalSummary}
            </p>
          </DocumentSection>
        ) : null}

        {showExperience ? (
          <DocumentSection title="Experience">
            <ExperienceEntries items={cv.experience} />
          </DocumentSection>
        ) : null}

        {showEducation ? (
          <DocumentSection title="Education">
            <EducationEntries items={cv.education} />
          </DocumentSection>
        ) : null}

        {showSkills ? (
          <DocumentSection title="Skills">
            <ul className="space-y-2 text-sm leading-6 text-slate-700">
              {cv.skills.filter(hasText).map((skill) => (
                <li key={skill} className="flex gap-2">
                  <span aria-hidden="true" className="text-slate-400">
                    •
                  </span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </DocumentSection>
        ) : null}

        {showLanguages ? (
          <DocumentSection title="Languages">
            <LanguageEntries items={cv.languages} />
          </DocumentSection>
        ) : null}

        {showCertifications ? (
          <DocumentSection title="Certifications">
            <CertificationEntries items={cv.certifications} />
          </DocumentSection>
        ) : null}
      </div>
    </article>
  );
}

export function ApplicationOptimizedCv({
  errorMessage,
  isLoading,
  onGenerate,
  optimizedCv,
}: ApplicationOptimizedCvProps) {
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
          </div>
          <button
            type="button"
            onClick={onGenerate}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Generate again
          </button>
        </section>

        <OptimizedCvDocument cv={optimizedCv} />
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
