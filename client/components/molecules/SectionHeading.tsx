type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <header className="space-y-5">
      {eyebrow && (
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted">
          {eyebrow}
        </p>
      )}
      <h1 className="display text-4xl leading-[0.95] md:text-7xl">{title}</h1>
      {description && (
        <p className="max-w-xl text-sm leading-relaxed text-ink/70">
          {description}
        </p>
      )}
    </header>
  );
}
