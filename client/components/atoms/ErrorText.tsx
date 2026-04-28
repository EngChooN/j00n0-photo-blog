type Props = { children?: React.ReactNode };

export function ErrorText({ children }: Props) {
  if (!children) return null;
  return (
    <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-ink/70">
      {children}
    </p>
  );
}
