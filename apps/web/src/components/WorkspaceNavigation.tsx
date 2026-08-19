const workspaceSections = [
  { id: "overview", label: "Overview" },
  { id: "job-analysis", label: "Job Analysis" },
  { id: "profile-match", label: "Profile Match" },
  { id: "optimized-cv", label: "Optimized CV" },
  { id: "cover-letter", label: "Cover Letter" },
  { id: "export", label: "Export" },
] as const;

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
  const completedSections = [
    isJobAnalysisCompleted ? "Job Analysis" : null,
    isProfileMatchCompleted ? "Profile Match" : null,
    isOptimizedCvCompleted ? "Optimized CV" : null,
    isCoverLetterCompleted ? "Cover Letter" : null,
  ].filter((section): section is string => section !== null);

  const nextRecommendedStep = !isJobAnalysisCompleted
    ? "Job Analysis"
    : !isProfileMatchCompleted
      ? "Profile Match"
      : !isOptimizedCvCompleted
        ? "Optimized CV"
        : !isCoverLetterCompleted
          ? "Cover Letter"
          : "Export";

  return (
    <nav aria-label="Application workspace sections" className="cc-card p-4">
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
            <li key={section.id}>
              {isCurrent ? (
                <span
                  aria-current="page"
                  className="flex min-h-16 items-center justify-between gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white"
                >
                  <span>{section.label}</span>
                  <span className="text-xs font-medium text-white/80">
                    Current
                  </span>
                </span>
              ) : isAvailable ? (
                <button
                  type="button"
                  onClick={() => onSectionChange(section.id)}
                  className="flex min-h-16 w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-left text-sm font-semibold text-ink transition hover:border-brand/40 hover:bg-brand-soft"
                >
                  <span>{section.label}</span>
                  <span
                    className={
                      isCompleted
                        ? "text-xs font-medium text-accent"
                        : "text-xs font-medium text-muted"
                    }
                  >
                    {isCompleted ? "Completed" : "Available"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex min-h-16 w-full cursor-not-allowed items-center justify-between gap-2 rounded-lg border border-line bg-canvas px-4 py-3 text-left text-sm font-semibold text-muted"
                >
                  <span>{section.label}</span>
                  <span className="text-xs font-medium text-muted/70">
                    Locked
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-col gap-1 text-xs text-muted sm:flex-row sm:justify-between">
        <p>
          Completed sections:{" "}
          {completedSections.length > 0 ? completedSections.join(", ") : "None"}
        </p>
        <p>
          Next recommended step:{" "}
          <span className="font-semibold text-ink">{nextRecommendedStep}</span>
        </p>
      </div>
    </nav>
  );
}
