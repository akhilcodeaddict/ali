"use client";

import { useEffect, useState, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { AuditLogPage } from "@/lib/admin-types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";

const activityTones: Record<string, "success" | "warning" | "neutral"> = {
  Create: "success",
  Update: "warning",
  Delete: "neutral",
  Login: "success",
  LoginFailed: "neutral",
  Logout: "neutral",
};

export default function ActivityPage() {
  const [data, setData] = useState<AuditLogPage | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [module, setModule] = useState("");
  const [activity, setActivity] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "50" });
      if (module) params.set("module", module);
      if (activity) params.set("activity", activity);
      if (userEmail) params.set("userEmail", userEmail);
      const [logs, mods] = await Promise.all([
        api.get<AuditLogPage>(`/api/audit-logs?${params}`),
        api.get<string[]>("/api/audit-logs/modules"),
      ]);
      setData(logs);
      setModules(mods);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load activity.");
    }
  }, [page, module, activity, userEmail]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-text">Activity</h1>
        <p className="mt-1 text-sm text-text-muted">
          Complete audit trail — who did what, when, and from where.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <CardBody className="flex flex-wrap items-center gap-3">
          <select
            value={module}
            onChange={(e) => { setModule(e.target.value); setPage(1); }}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">All modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={activity}
            onChange={(e) => { setActivity(e.target.value); setPage(1); }}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">All activities</option>
            {["Create", "Update", "Delete", "Login", "LoginFailed", "Logout"].map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <Input
            placeholder="Filter by user email…"
            value={userEmail}
            onChange={(e) => { setUserEmail(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <span className="ml-auto text-sm text-text-helper">
            {data ? `${data.total} event(s)` : "Loading…"}
          </span>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Events" />
        {data === null && <SkeletonTable rows={4} cols={4} />}
        {data && data.items.length === 0 && <EmptyState label="No activity recorded yet." />}
        {data && data.items.length > 0 && (
          <>
            <Table>
              <TableHead columns={["Activity", "Module", "Entity", "User", "IP", "When"]} />
              <tbody>
                {data.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge tone={activityTones[log.activity] ?? "neutral"}>{log.activity}</Badge>
                      {log.status === "Failed" && (
                        <Badge tone="neutral" className="ml-1">Failed</Badge>
                      )}
                    </TableCell>
                    <TableCell muted>{log.module}</TableCell>
                    <TableCell>
                      <span className="text-text">{log.entityName ?? "—"}</span>
                      {log.details && (
                        <>
                          <br />
                          <span className="text-xs text-text-helper">{log.details}</span>
                        </>
                      )}
                    </TableCell>
                    <TableCell muted>{log.userEmail ?? "system"}</TableCell>
                    <TableCell muted>{log.ipAddress ?? "—"}</TableCell>
                    <TableCell muted>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
            <div className="flex items-center justify-between border-t border-border px-6 py-3">
              <span className="text-sm text-text-helper">
                Page {data.page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
