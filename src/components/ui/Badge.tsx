import clsx from "clsx";

type BadgeTone = "success" | "warning" | "neutral" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-status-success-bg text-status-success-text",
  warning: "bg-status-warning-bg text-status-warning-text",
  neutral: "bg-status-neutral-bg text-status-neutral-text",
  danger: "bg-status-danger-bg text-status-danger-text",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function progressTone(percent: number): BadgeTone {
  if (percent >= 100) return "success";
  if (percent > 0) return "warning";
  return "neutral";
}
