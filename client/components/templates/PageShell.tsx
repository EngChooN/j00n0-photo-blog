type Props = {
  children: React.ReactNode;
  className?: string;
};

export function PageShell({ children, className = '' }: Props) {
  return (
    <div
      className={[
        'mx-auto max-w-[1400px] px-6 pb-24 pt-8 md:px-12 md:pt-20',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
