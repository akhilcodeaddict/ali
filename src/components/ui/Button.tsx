import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[var(--shadow-button)] hover:bg-primary-dark active:translate-y-px disabled:opacity-50",
  secondary:
    "bg-white text-heading border border-border shadow-[var(--shadow-button)] hover:bg-section hover:shadow-[var(--shadow-card-hover)] disabled:opacity-50",
  ghost:
    "bg-transparent text-text-muted hover:text-text hover:bg-section disabled:opacity-50",
  danger:
    "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)] border border-transparent shadow-[var(--shadow-button)] hover:brightness-95 disabled:opacity-50",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
          size === "md" ? "px-3.5 py-2 text-sm" : "px-2.5 py-1.5 text-[13px]",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
