import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { invalid, className = '', ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={[
        'w-full resize-none border bg-transparent p-4 text-sm leading-relaxed text-ink placeholder:text-muted/60 focus:outline-none transition-colors',
        invalid ? 'border-ink' : 'border-line focus:border-ink',
        className,
      ].join(' ')}
      {...rest}
    />
  );
});
