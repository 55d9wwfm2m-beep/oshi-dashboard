export function PageHeader({
  emoji,
  title,
  subtitle,
  right,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-navy-800">
          <span aria-hidden>{emoji}</span>
          <span className="truncate">{title}</span>
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-navy-600">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
