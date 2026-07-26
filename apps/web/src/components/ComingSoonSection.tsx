interface ComingSoonSectionProps {
  title: string;
}

export function ComingSoonSection({ title }: ComingSoonSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-4 rounded-lg bg-slate-100 px-4 py-6 text-center text-sm font-semibold text-slate-500">
        Coming Soon
      </p>
    </section>
  );
}
