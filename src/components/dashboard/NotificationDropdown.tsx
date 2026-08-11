"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-section text-text-muted transition-colors hover:text-primary"
        aria-label="View notifications"
      >
        <Bell size={16} strokeWidth={1.75} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 rounded-lg border border-border bg-surface p-3.5 shadow-[var(--shadow-card-hover)]">
            <div className="mb-1 flex items-center justify-between px-1 py-1">
              <span className="text-[15px] font-semibold text-heading">Notifications</span>
            </div>
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BellOff size={22} strokeWidth={1.5} className="text-text-helper" />
              <p className="text-sm text-text-muted">No new notifications</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
