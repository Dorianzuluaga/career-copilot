interface ComingSoonSectionProps {
  title: string;
}

export function ComingSoonSection({ title }: ComingSoonSectionProps) {
  return (
    <section className="cc-card p-6">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mt-4 rounded-lg bg-canvas px-4 py-6 text-center text-sm font-semibold text-muted">
        Coming Soon
      </p>
    </section>
  );
}
