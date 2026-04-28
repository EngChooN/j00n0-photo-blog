import { Label } from '@/components/atoms/Label';
import { ErrorText } from '@/components/atoms/ErrorText';

type Props = {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
};

export function FormField({ label, htmlFor, error, children }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
