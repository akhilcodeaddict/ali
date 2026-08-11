export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-border/70 ${className ?? ""}`} />;
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <table className="w-full">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  );
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function SkeletonField({ wide }: { wide?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className={`h-9 w-full ${wide ? "sm:col-span-2" : ""}`} />
    </div>
  );
}

