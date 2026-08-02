export function ApplicationExport() {
  return (
    <section
      aria-labelledby="export-title"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <p className="text-sm font-semibold text-blue-700">
        Application documents
      </p>
      <h2
        id="export-title"
        className="mt-1 text-2xl font-bold text-slate-950"
      >
        Export
      </h2>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        No exportable documents are currently available. PDF generation and
        document export will be implemented in a future Epic.
      </p>
    </section>
  );
}
