import type { LabelHTMLAttributes } from 'react';

type Props = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = '', children, ...rest }: Props) {
  return (
    <label
      className={[
        'block text-[10px] uppercase tracking-[0.3em] text-muted',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </label>
  );
}
