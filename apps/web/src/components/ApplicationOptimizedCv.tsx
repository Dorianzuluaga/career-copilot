export function ApplicationOptimizedCv() {
  return (
    <section
      aria-labelledby="optimized-cv-title"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
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
        No optimized CV has been generated yet. Optimized CV generation will be
        implemented in a future Epic.
      </p>
    </section>
  );
}
