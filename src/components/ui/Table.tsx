export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr className="border-b border-border bg-section">
        {columns.map((col, i) => (
          <th
            key={`${col}-${i}`}
            className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-helper"
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TableRow({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-border last:border-0 hover:bg-section transition-colors ${className ?? ""}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <td className={`px-6 py-3.5 ${muted ? "text-text-muted" : "text-text"}`}>
      {children}
    </td>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}
