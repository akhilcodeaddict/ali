export type ActiveFilterValue = "active" | "all" | "inactive";

/** Small filter-tab control for admin list pages: defaults to "Active", with a toggle to reveal deactivated items too. */
export function ActiveFilter({
  value,
  onChange,
}: {
  value: ActiveFilterValue;
  onChange: (v: ActiveFilterValue) => void;
}) {
  const options: { value: ActiveFilterValue; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "all", label: "All" },
  ];
  return (
    <div className="flex items-center gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            value === o.value ? "bg-primary text-white" : "text-text-muted hover:bg-surface-hover"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function filterByActive<T extends { isActive: boolean }>(items: T[], filter: ActiveFilterValue): T[] {
  if (filter === "all") return items;
  if (filter === "inactive") return items.filter((i) => !i.isActive);
  return items.filter((i) => i.isActive);
}
