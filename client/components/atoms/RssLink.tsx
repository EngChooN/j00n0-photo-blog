type Props = {
  className?: string;
};

function RssIcon() {
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
      <path d="M4 4a16 16 0 0 1 16 16" />
      <path d="M4 11a9 9 0 0 1 9 9" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RssLink({ className = '' }: Props) {
  return (
    <a
      href="/rss.xml"
      aria-label="RSS feed"
      className={[
        'inline-flex h-[44px] w-[44px] items-center justify-center text-ink/60 transition-colors hover:text-ink md:h-auto md:w-auto',
        className,
      ].join(' ')}
    >
      <RssIcon />
    </a>
  );
}
