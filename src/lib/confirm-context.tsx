"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

type Ask = (message: string, options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Ask | null>(null);

/** In-app replacement for window.confirm: resolves true when confirmed. */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<{ message: string; options: ConfirmOptions } | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const confirmBtn = useRef<HTMLButtonElement>(null);

  const ask = useCallback<Ask>((message, options = {}) => {
    // A second request while one is open cancels the first.
    resolver.current?.(false);
    setOpen({ message, options });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOpen(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    confirmBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/45 p-4"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card-hover)] animate-toast-in"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-danger-bg text-status-danger-text">
                <AlertTriangle size={18} />
              </span>
              <div className="min-w-0">
                <h2 id="confirm-title" className="text-[15px] font-bold text-heading">
                  {open.options.title ?? "Are you sure?"}
                </h2>
                <p id="confirm-message" className="mt-1 text-sm leading-relaxed text-text-muted">
                  {open.message}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => close(false)}>
                {open.options.cancelLabel ?? "Cancel"}
              </Button>
              <Button ref={confirmBtn} variant="danger" size="sm" onClick={() => close(true)}>
                {open.options.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): Ask {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
