type Props = { className?: string };

export function Hairline({ className = '' }: Props) {
  return <div className={['h-px w-full bg-line', className].join(' ')} />;
}
