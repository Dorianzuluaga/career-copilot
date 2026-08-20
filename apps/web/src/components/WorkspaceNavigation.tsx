import { useLocale } from "../hooks/useLocale";
import type { TranslationKey } from "../i18n/messages";

const workspaceSections = [
  { id: "overview", labelKey: "workspace.sections.overview" },
  { id: "job-analysis", labelKey: "workspace.sections.jobAnalysis" },
  { id: "profile-match", labelKey: "workspace.sections.profileMatch" },
  { id: "optimized-cv", labelKey: "workspace.sections.optimizedCv" },
  { id: "cover-letter", labelKey: "workspace.sections.coverLetter" },
  { id: "export", labelKey: "workspace.sections.export" },
] as const satisfies ReadonlyArray<{
  id: string;
  labelKey: TranslationKey;
}>;

export type WorkspaceSection = (typeof workspaceSections)[number]["id"];

interface WorkspaceNavigationProps {
  activeSection: WorkspaceSection;
  isJobAnalysisCompleted: boolean;
  isProfileMatchCompleted: boolean;
  isOptimizedCvCompleted: boolean;
  isCoverLetterCompleted: boolean;
  onSectionChange: (section: WorkspaceSection) => void;
}

export function WorkspaceNavigation({
  activeSection,
  isJobAnalysisCompleted,
  isProfileMatchCompleted,
  isOptimizedCvCompleted,
  isCoverLetterCompleted,
  onSectionChange,
}: WorkspaceNavigationProps) {
  const { t } = useLocale();

  const completedSections = [
    isJobAnalysisCompleted ? t("workspace.sections.jobAnalysis") : null,
    isProfileMatchCompleted ? t("workspace.sections.profileMatch") : null,
    isOptimizedCvCompleted ? t("workspace.sections.optimizedCv") : null,
    isCoverLetterCompleted ? t("workspace.sections.coverLetter") : null,
  ].filter((section): section is string => section !== null);

  const nextRecommendedStep = !isJobAnalysisCompleted
    ? t("workspace.sections.jobAnalysis")
    : !isProfileMatchCompleted
      ? t("workspace.sections.profileMatch")
      : !isOptimizedCvCompleted
        ? t("workspace.sections.optimizedCv")
        : !isCoverLetterCompleted
          ? t("workspace.sections.coverLetter")
          : t("workspace.sections.export");

  const stepItemClassName =
    "flex min-h-16 h-full w-full min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg px-4 py-3 text-left text-sm font-semibold lg:flex-col lg:items-stretch lg:justify-center lg:px-3";
  const stepLabelClassName = "min-w-0 max-w-full wrap-break-word";
  const stepStatusClassName =
    "min-w-0 max-w-full wrap-break-word text-xs font-medium";

  return (
    <nav
      aria-label={t("workspace.sectionsAriaLabel")}
      className="cc-card p-4 lg:px-3"
    >
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        {workspaceSections.map((section) => {
          const isCurrent = section.id === activeSection;
          const isCoverLetterAvailable = isOptimizedCvCompleted;
          const isExportAvailable = isCoverLetterCompleted;
          const isAvailable =
            section.id === "overview" ||
            section.id === "job-analysis" ||
            (section.id === "profile-match" && isJobAnalysisCompleted) ||
            (section.id === "optimized-cv" && isProfileMatchCompleted) ||
            (section.id === "cover-letter" && isCoverLetterAvailable) ||
            (section.id === "export" && isExportAvailable);
          const isCompleted =
            (section.id === "job-analysis" && isJobAnalysisCompleted) ||
            (section.id === "profile-match" && isProfileMatchCompleted) ||
            (section.id === "optimized-cv" && isOptimizedCvCompleted) ||
            (section.id === "cover-letter" && isCoverLetterCompleted);

          return (
            <li key={section.id} className="min-w-0">
              {isCurrent ? (
                <span
                  aria-current="page"
                  className={`${stepItemClassName} bg-brand text-white`}
                >
                  <span className={stepLabelClassName}>
                    {t(section.labelKey)}
                  </span>
                  <span className={`${stepStatusClassName} text-white/80`}>
                    {t("workspace.current")}
                  </span>
                </span>
              ) : isAvailable ? (
                <button
                  type="button"
                  onClick={() => onSectionChange(section.id)}
                  className={`${stepItemClassName} border border-line bg-surface text-ink transition hover:border-brand/40 hover:bg-brand-soft`}
                >
                  <span className={stepLabelClassName}>
                    {t(section.labelKey)}
                  </span>
                  <span
                    className={
                      isCompleted
                        ? `${stepStatusClassName} text-accent`
                        : `${stepStatusClassName} text-muted`
                    }
                  >
                    {isCompleted
                      ? t("workspace.completed")
                      : t("workspace.available")}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className={`${stepItemClassName} cursor-not-allowed border border-line bg-canvas text-muted`}
                >
                  <span className={stepLabelClassName}>
                    {t(section.labelKey)}
                  </span>
                  <span className={`${stepStatusClassName} text-muted/70`}>
                    {t("workspace.locked")}
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-col gap-1 text-xs text-muted sm:flex-row sm:justify-between">
        <p>
          {t("workspace.completedSections", {
            sections:
              completedSections.length > 0
                ? completedSections.join(", ")
                : t("workspace.completedNone"),
          })}
        </p>
        <p>
          {t("workspace.nextStep")}{" "}
          <span className="font-semibold text-ink">{nextRecommendedStep}</span>
        </p>
      </div>
    </nav>
  );
}
