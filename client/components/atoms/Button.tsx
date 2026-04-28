import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

const styles: Record<Variant, string> = {
  primary:
    'border border-ink text-ink hover:bg-ink hover:text-paper px-6 py-3',
  ghost: 'text-muted hover:text-ink px-3 py-2',
  danger:
    'border border-ink/40 text-muted hover:border-ink hover:text-ink px-3 py-2',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', fullWidth, className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={[
        'inline-flex items-center justify-center text-[11px] uppercase tracking-[0.25em] transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        styles[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
});
