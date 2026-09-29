"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/toast-context";
import { Trash2, RefreshCw } from "lucide-react";

interface CacheModuleInfo {
  module: string;
  label: string;
  enabled: boolean;
  hasCache: boolean;
  fileSizeBytes: number;
  lastUpdated: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function CachePage() {
  const toast = useToast();
  const [modules, setModules] = useState<CacheModuleInfo[] | null>(null);
  const [clearing, setClearing] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    try {
      setModules(null);
      setModules(await api.get<CacheModuleInfo[]>("/api/cache"));
    } catch (err) {
      toast.error("Failed to load cache info", err instanceof ApiError ? err.message : undefined);
      setModules([]);
    }
  }

  useEffect(() => { load(); }, []);

  async function clearModule(module: string) {
    setClearing(module);
    try {
      await api.delete(`/api/cache/${module}`);
      toast.success(`Cache cleared for ${module}`);
      load();
    } catch (err) {
      toast.error("Failed to clear cache", err instanceof ApiError ? err.message : undefined);
    } finally {
      setClearing(null);
    }
  }

  async function clearAll() {
    if (!window.confirm("Clear all module caches? Next request for each module will reload from the database.")) return;
    setClearing("__all__");
    try {
      await api.delete("/api/cache");
      toast.success("All caches cleared");
      load();
    } catch (err) {
      toast.error("Failed to clear all caches", err instanceof ApiError ? err.message : undefined);
    } finally {
      setClearing(null);
    }
  }

  async function toggleModule(module: string, enabled: boolean) {
    setToggling(module);
    try {
      await api.put(`/api/cache/${module}/enabled`, { enabled });
      toast.success(enabled ? `Cache enabled for ${module}` : `Cache disabled for ${module}`);
      load();
    } catch (err) {
      toast.error("Failed to update cache setting", err instanceof ApiError ? err.message : undefined);
    } finally {
      setToggling(null);
    }
  }

  const cached = modules?.filter((m) => m.hasCache) ?? [];
  const total = cached.reduce((sum, m) => sum + m.fileSizeBytes, 0);
  const enabled = modules?.filter((m) => m.enabled).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-heading">Cache Manager</h1>
          <p className="mt-1 text-sm text-text-muted">
            Module-level JSON file cache. Data is served from disk; cleared automatically when you save changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={load}>
            <RefreshCw size={14} strokeWidth={1.75} />
            Refresh
          </Button>
          <Button
            variant="danger"
            onClick={clearAll}
            disabled={clearing === "__all__"}
          >
            <Trash2 size={14} strokeWidth={1.75} />
            {clearing === "__all__" ? "Clearing…" : "Clear All"}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {modules && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Modules", value: String(modules.length) },
            { label: "Cache Enabled", value: String(enabled) },
            { label: "Cached Modules", value: String(cached.length) },
            { label: "Total Cache Size", value: formatBytes(total) },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-[10px] border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
            >
              <p className="text-[12px] font-medium text-text-muted">{s.label}</p>
              <p className="mt-1 text-[22px] font-bold text-heading">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader
          title="Module Cache Status"
          description="Toggle per-module caching or clear individual caches"
        />
        {modules === null && <SkeletonTable rows={8} cols={5} />}
        {modules?.length === 0 && <EmptyState label="No cache modules found." />}
        {modules && modules.length > 0 && (
          <Table>
            <TableHead columns={["Module", "Cache", "File Size", "Last Updated", "Enabled", ""]} />
            <tbody>
              {modules.map((m) => (
                <TableRow key={m.module}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-text">{m.label}</p>
                      <p className="text-xs text-text-helper font-mono">{m.module}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge tone={m.hasCache ? "success" : "neutral"}>
                      {m.hasCache ? "Cached" : "No cache"}
                    </Badge>
                  </TableCell>
                  <TableCell muted>
                    {m.hasCache ? formatBytes(m.fileSizeBytes) : "—"}
                  </TableCell>
                  <TableCell muted>
                    {m.lastUpdated ? relativeTime(m.lastUpdated) : "—"}
                  </TableCell>
                  <TableCell>
                    <Toggle
                      checked={m.enabled}
                      onChange={(v) => toggleModule(m.module, v)}
                      disabled={toggling === m.module}
                      label=""
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => clearModule(m.module)}
                      disabled={!m.hasCache || clearing === m.module}
                    >
                      <Trash2 size={13} strokeWidth={1.75} />
                      {clearing === m.module ? "…" : "Clear"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <div className="rounded-[10px] border border-border bg-section/60 px-5 py-4 text-sm text-text-muted">
        <strong className="text-text">How it works:</strong> On first request, data loads from the database and saves as a
        JSON file in <code className="font-mono text-primary">backend/cache/{"{module}"}.json</code>.
        Subsequent requests read from this file. When you create, update, or delete any item, its
        module cache is deleted automatically — the next request re-fills it from the database.
        Disable a module to always bypass cache for that data (useful during active editing).
      </div>
    </div>
  );
}
