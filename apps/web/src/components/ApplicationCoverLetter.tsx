export function ApplicationCoverLetter() {
  return (
    <section
      aria-labelledby="cover-letter-title"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <p className="text-sm font-semibold text-blue-700">
        Application document
      </p>
      <h2
        id="cover-letter-title"
        className="mt-1 text-2xl font-bold text-slate-950"
      >
        Cover Letter
      </h2>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        No cover letter has been generated yet. Cover Letter generation will be
        implemented in a future Epic.
      </p>
    </section>
  );
}
