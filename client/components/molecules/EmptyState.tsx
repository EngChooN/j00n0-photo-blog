type Props = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: Props) {
  return (
    <div className="border border-dashed border-line py-24 text-center">
      <p className="display text-3xl">{title}</p>
      {description && (
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">{description}</p>
      )}
    </div>
  );
}
