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
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-5 shadow-[var(--shadow-card)]">
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

export function SkeletonBlogForm() {
  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-[8px]" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-3.5 w-52" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-[8px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          {/* content card */}
          <div className="rounded-[12px] border border-border bg-white p-5 shadow-[var(--shadow-card)] flex flex-col gap-5">
            <Skeleton className="h-5 w-24" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
            </div>
            <SkeletonField />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-[260px] w-full rounded-[8px]" />
            </div>
          </div>
          {/* status card */}
          <div className="rounded-[12px] border border-border bg-white p-5 shadow-[var(--shadow-card)] flex flex-col gap-4">
            <Skeleton className="h-5 w-16" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-9 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        {/* preview card */}
        <div className="rounded-[12px] border border-border bg-white p-5 shadow-[var(--shadow-card)] flex flex-col gap-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-32 w-full rounded-[4px]" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-[200px] w-full rounded-[4px]" />
        </div>
      </div>
    </div>
  );
}
