type Props = {
  className?: string;
  label?: string;
  compact?: boolean;
};

const HREF = 'https://www.instagram.com/j00n0__/';

function InstagramIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function InstagramLink({
  className = '',
  label = 'Instagram',
  compact = false,
}: Props) {
  if (compact) {
    return (
      <a
        href={HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram (@j00n0__)"
        className={[
          'inline-flex h-[44px] w-[44px] items-center justify-center text-ink/60 transition-colors hover:text-ink md:h-auto md:w-auto',
          className,
        ].join(' ')}
      >
        <InstagramIcon />
      </a>
    );
  }
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
      <InstagramIcon />
      <span>{label}</span>
      <span aria-hidden className="text-[10px]">
        @j00n0__
      </span>
      <span
        aria-hidden
        className="inline-block translate-x-0 transition-transform group-hover:translate-x-1"
      >
        ↗
      </span>
    </a>
  );
}
