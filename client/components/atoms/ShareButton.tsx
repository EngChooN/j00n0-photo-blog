'use client';

type Props = {
  label: 'Share' | 'Copied!' | 'Failed';
  onClick: () => void;
};

function ShareIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export function ShareButton({ label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Share this post"
      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-white/40 underline-offset-4 transition-colors hover:text-white hover:underline"
    >
      <ShareIcon />
      <span>{label}</span>
    </button>
  );
}
