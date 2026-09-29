"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
}

interface ToastContextValue {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION = 4500;

const STYLES: Record<ToastVariant, { bar: string; icon: React.ReactNode; label: string }> = {
  success: {
    bar: "bg-status-success-text",
    icon: <CheckCircle2 size={18} className="text-status-success-text shrink-0" />,
    label: "Success",
  },
  error: {
    bar: "bg-status-danger-text",
    icon: <XCircle size={18} className="text-status-danger-text shrink-0" />,
    label: "Error",
  },
  warning: {
    bar: "bg-status-warning-text",
    icon: <AlertTriangle size={18} className="text-status-warning-text shrink-0" />,
    label: "Warning",
  },
  info: {
    bar: "bg-primary",
    icon: <Info size={18} className="text-primary shrink-0" />,
    label: "Info",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((variant: ToastVariant, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev.slice(-4), { id, variant, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), DURATION);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const ctx: ToastContextValue = {
    success: (t, m) => add("success", t, m),
    error: (t, m) => add("error", t, m),
    warning: (t, m) => add("warning", t, m),
    info: (t, m) => add("info", t, m),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container */}
      <div className="fixed top-5 left-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => {
          const s = STYLES[t.variant];
          return (
            <div
              key={t.id}
              className="pointer-events-auto w-[340px] overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card-hover)] animate-toast-in"
              role="alert"
            >
              {/* Progress bar */}
              <div
                className={`h-[3px] ${s.bar} animate-toast-bar`}
                style={{ animationDuration: `${DURATION}ms` }}
              />
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading leading-snug">{t.title}</p>
                  {t.message && (
                    <p className="mt-0.5 text-xs text-text-muted leading-relaxed">{t.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="text-text-helper hover:text-text transition-colors cursor-pointer mt-0.5 shrink-0"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
