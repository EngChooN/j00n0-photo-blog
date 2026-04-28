type Props = {
  className?: string;
  label?: string;
};

const HREF = 'https://www.instagram.com/j00n0__/';

export function InstagramLink({ className = '', label = 'Instagram' }: Props) {
  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink/70 transition-colors hover:text-ink',
        className,
      ].join(' ')}
    >
      <span>{label}</span>
      <span aria-hidden className="text-[10px]">@j00n0__</span>
      <span
        aria-hidden
        className="inline-block translate-x-0 transition-transform group-hover:translate-x-1"
      >
        ↗
      </span>
    </a>
  );
}
