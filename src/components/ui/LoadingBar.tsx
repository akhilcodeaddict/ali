"use client";

import { useSyncExternalStore } from "react";
import { subscribe, getSnapshot, getServerSnapshot } from "@/lib/loading-store";

/** Slim top progress bar, visible whenever one or more API requests are in flight. */
export function LoadingBar() {
  const count = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const active = count > 0;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden transition-opacity duration-200 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-full w-1/3 animate-loading-bar bg-primary" />
    </div>
  );
}
