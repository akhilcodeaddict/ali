"use client";

import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-warning-bg text-status-warning-text">
        <AlertTriangle size={22} strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-text">Something went wrong</h2>
        <p className="mt-1 max-w-md text-sm text-text-muted">
          {error.message || "An unexpected error occurred while rendering this page."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="secondary" onClick={() => (window.location.href = "/dashboard")}>
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
