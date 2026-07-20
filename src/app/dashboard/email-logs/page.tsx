"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/toast-context";
import { Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface EmailLog {
  id: string;
  toEmail: string;
  subject: string;
  templateKey: string;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
}

const PAGE_SIZE = 50;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function EmailLogsPage() {
  const toast = useToast();
  const [logs, setLogs] = useState<EmailLog[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [clearing, setClearing] = useState(false);

  async function load(p = page) {
    try {
      setLogs(null);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5299"}/api/email/logs?page=${p}&pageSize=${PAGE_SIZE}`,
        {
          headers: {
            Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("wbt_token") : ""}`,
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const count = parseInt(res.headers.get("X-Total-Count") ?? "0", 10);
      setTotal(count);
      setLogs(await res.json());
    } catch (err) {
      toast.error("Failed to load logs");
      setLogs([]);
    }
  }

  useEffect(() => { load(page); }, [page]);

  async function clearAll() {
    if (!window.confirm("Clear all email logs? This cannot be undone.")) return;
    setClearing(true);
    try {
      await api.delete("/api/email/logs");
      toast.success("All logs cleared");
      setPage(1);
      load(1);
    } catch (err) {
      toast.error("Failed to clear logs", err instanceof ApiError ? err.message : undefined);
    } finally {
      setClearing(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const sent = logs?.filter((l) => l.success).length ?? 0;
  const failed = logs?.filter((l) => !l.success).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-heading">Email Logs</h1>
          <p className="mt-1 text-sm text-text-muted">
            History of all email attempts — both sent and failed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => load(page)}>
            <RefreshCw size={14} strokeWidth={1.75} /> Refresh
          </Button>
          <Button variant="danger" onClick={clearAll} disabled={clearing}>
            <Trash2 size={14} strokeWidth={1.75} />
            {clearing ? "Clearing…" : "Clear All"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      {logs && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total (this page)", value: String(logs.length) },
            { label: "Sent", value: String(sent) },
            { label: "Failed", value: String(failed) },
          ].map((s) => (
            <div key={s.label} className="rounded-[10px] border border-border bg-white p-4 shadow-[var(--shadow-card)]">
              <p className="text-[12px] font-medium text-text-muted">{s.label}</p>
              <p className="mt-1 text-[22px] font-bold text-heading">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader
          title="Log History"
          description={total > 0 ? `${total} total entries` : "No logs yet"}
        />
        {logs === null && <SkeletonTable rows={8} cols={5} />}
        {logs?.length === 0 && <EmptyState label="No email logs yet. Logs appear when emails are attempted." />}
        {logs && logs.length > 0 && (
          <>
            <Table>
              <TableHead columns={["Recipient", "Subject", "Template", "Status", "When"]} />
              <tbody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <p className="font-mono text-xs">{l.toEmail}</p>
                    </TableCell>
                    <TableCell muted>{l.subject}</TableCell>
                    <TableCell>
                      <code className="text-xs font-mono text-text-helper">{l.templateKey}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge tone={l.success ? "success" : "warning"}>
                          {l.success ? "Sent" : "Failed"}
                        </Badge>
                        {l.errorMessage && (
                          <p className="text-[11px] text-status-warning-text max-w-[240px] truncate" title={l.errorMessage}>
                            {l.errorMessage}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell muted>{relativeTime(l.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-3">
                <p className="text-sm text-text-muted">
                  Page {page} of {totalPages} &nbsp;·&nbsp; {total} entries
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={14} /> Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
