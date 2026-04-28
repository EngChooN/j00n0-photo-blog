type Props = {
  children: React.ReactNode;
};

export function CenteredShell({ children }: Props) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-md items-center px-6 py-16">
      <div className="w-full">{children}</div>
    </div>
  );
}
