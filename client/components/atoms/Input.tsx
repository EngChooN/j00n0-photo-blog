import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { invalid, className = '', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={[
        'w-full border-b bg-transparent py-3 text-sm text-ink placeholder:text-muted/60 focus:outline-none transition-colors',
        invalid ? 'border-ink' : 'border-line focus:border-ink',
        className,
      ].join(' ')}
      {...rest}
    />
  );
});
