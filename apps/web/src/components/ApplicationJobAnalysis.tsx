import type { JobAnalysis, PersistedApplication } from "../types/job-analysis";

interface ApplicationJobAnalysisProps {
  application: PersistedApplication;
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function AnalysisList({ title, values }: { title: string; values: string[] }) {
  return (
    <section>
      <h3 className="text-sm font-bold text-slate-950">{title}</h3>
      {values.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
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
        <p className="mt-2 text-sm text-slate-500">Not identified</p>
      )}
    </section>
  );
}

function StructuredAnalysis({ analysis }: { analysis: JobAnalysis }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-950">Job analysis</h2>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          Version {analysis.analysisVersion}
        </span>
      </div>

      <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Employment type" value={analysis.employmentType} />
        <Detail label="Location" value={analysis.location} />
        <Detail label="Experience level" value={analysis.experienceLevel} />
        <Detail label="Education" value={analysis.education} />
        <Detail
          label="Languages"
          value={
            analysis.languages.length > 0 ? analysis.languages.join(", ") : null
          }
        />
      </dl>

      <div className="mt-6 border-t border-slate-100 pt-6">
        <h3 className="text-sm font-bold text-slate-950">Summary</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {analysis.summary || "Not identified"}
        </p>
      </div>

      <div className="mt-6 grid gap-8 border-t border-slate-100 pt-6 md:grid-cols-3">
        <AnalysisList
          title="Required skills"
          values={analysis.requiredSkills}
        />
        <AnalysisList
          title="Responsibilities"
          values={analysis.responsibilities}
        />
        <AnalysisList title="ATS keywords" values={analysis.atsKeywords} />
      </div>
    </section>
  );
}

export function ApplicationJobAnalysis({
  application,
}: ApplicationJobAnalysisProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Original job description
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-900">
          {application.jobOffer?.originalDescription ?? "Not available"}
        </p>
      </section>

      {application.jobAnalysis && (
        <StructuredAnalysis analysis={application.jobAnalysis} />
      )}
    </div>
  );
}
