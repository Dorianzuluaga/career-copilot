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
  onSectionChange: (section: WorkspaceSection) => void;
}

export function WorkspaceNavigation({
  activeSection,
  isJobAnalysisCompleted,
  isProfileMatchCompleted,
  onSectionChange,
}: WorkspaceNavigationProps) {
  const completedSections = [
    isJobAnalysisCompleted ? "Job Analysis" : null,
    isProfileMatchCompleted ? "Profile Match" : null,
  ].filter((section): section is string => section !== null);

  const nextRecommendedStep = !isJobAnalysisCompleted
    ? "Job Analysis"
    : !isProfileMatchCompleted
      ? "Profile Match"
      : "Optimized CV";

  return (
    <nav
      aria-label="Application workspace sections"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        {workspaceSections.map((section) => {
          const isCurrent = section.id === activeSection;
          const isCoverLetterAvailable = isProfileMatchCompleted;
          const isAvailable =
            section.id === "overview" ||
            section.id === "job-analysis" ||
            (section.id === "profile-match" && isJobAnalysisCompleted) ||
            ((section.id === "optimized-cv" || section.id === "cover-letter") &&
              isProfileMatchCompleted) ||
            (section.id === "export" && isCoverLetterAvailable);
          const isCompleted =
            (section.id === "job-analysis" && isJobAnalysisCompleted) ||
            (section.id === "profile-match" && isProfileMatchCompleted);

          return (
            <li key={section.id}>
              {isCurrent ? (
                <span
                  aria-current="page"
                  className="flex min-h-16 items-center justify-between gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  <span>{section.label}</span>
                  <span className="text-xs font-medium text-blue-100">
                    Current
                  </span>
                </span>
              ) : isAvailable ? (
                <button
                  type="button"
                  onClick={() => onSectionChange(section.id)}
                  className="flex min-h-16 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <span>{section.label}</span>
                  <span className="text-xs font-medium text-slate-500">
                    {isCompleted ? "Completed" : "Available"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex min-h-16 w-full cursor-not-allowed items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-500"
                >
                  <span>{section.label}</span>
                  <span className="text-xs font-medium text-slate-400">
                    Locked
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:justify-between">
        <p>
          Completed sections:{" "}
          {completedSections.length > 0 ? completedSections.join(", ") : "None"}
        </p>
        <p>
          Next recommended step:{" "}
          <span className="font-semibold text-slate-700">
            {nextRecommendedStep}
          </span>
        </p>
      </div>
    </nav>
  );
}
