import type { ProfileComparison } from "../types/profile-comparison";

interface ApplicationProfileMatchProps {
  comparison: ProfileComparison | null;
  errorMessage: string | null;
  isLoading: boolean;
  onCompare: () => void;
  onReturnToJobAnalysis: () => void;
}

function ComparisonList({
  title,
  values,
}: {
  title: string;
  values: string[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-950">{title}</h3>
      {values.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          {values.map((value) => (
            <li key={value} className="flex gap-2">
              <span aria-hidden="true" className="text-blue-600">
                •
              </span>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">None identified</p>
      )}
    </section>
  );
}

export function ApplicationProfileMatch({
  comparison,
  errorMessage,
  isLoading,
  onCompare,
  onReturnToJobAnalysis,
}: ApplicationProfileMatchProps) {
  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Profile Match</h2>
        <p className="mt-2 text-sm text-slate-600">
          Comparing your Master CV with this job analysis…
        </p>
      </section>
    );
  }

  if (!comparison) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Profile Match</h2>
        <p className="mt-2 text-sm text-slate-600">
          {errorMessage ??
            "Compare your Master CV with the completed job analysis."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onReturnToJobAnalysis}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Return to Job Analysis
          </button>
          <button
            type="button"
            onClick={onCompare}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {errorMessage ? "Try again" : "Compare profile"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700">Profile Match</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              ATS Match
            </h2>
          </div>
          <p className="text-5xl font-bold tracking-tight text-blue-700">
            {comparison.alignmentScore}%
          </p>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <ComparisonList
          title="Matching Skills"
          values={comparison.matchingSkills}
        />
        <ComparisonList
          title="Missing Skills"
          values={comparison.missingSkills}
        />
        <ComparisonList title="Strengths" values={comparison.strengths} />
        <ComparisonList title="Weaknesses" values={comparison.weaknesses} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-950">Recommendation</h3>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {comparison.recommendation}
        </p>
      </section>

      <button
        type="button"
        onClick={onReturnToJobAnalysis}
        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Return to Job Analysis
      </button>
    </div>
  );
}
