import clsx from "clsx";

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative h-[22px] w-[38px] rounded-full transition-colors duration-200 shrink-0",
          "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
          checked ? "bg-primary" : "bg-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={clsx(
            "absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform duration-200",
            checked && "translate-x-4"
          )}
        />
      </button>
      {label && <span className="text-sm font-medium text-text">{label}</span>}
    </label>
  );
}
