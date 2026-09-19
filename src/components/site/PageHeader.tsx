export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="section-x border-b border-border bg-ink py-24 text-ink-foreground md:py-32">
      <p className="eyebrow text-ink-foreground/50 reveal-up">{eyebrow}</p>
      <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl reveal-up">
        {title}
      </h1>
      {intro && (
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-foreground/60 reveal-up">
          {intro}
        </p>
      )}
    </section>
  );
}
