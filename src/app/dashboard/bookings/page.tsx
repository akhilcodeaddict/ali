"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { BookingDto, BookingStatus } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Trash2, RefreshCw, MessageSquareText, Mail, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast-context";
import { useConfirm } from "@/lib/confirm-context";

const STATUSES: BookingStatus[] = ["Pending", "Confirmed", "Completed", "Cancelled"];

function statusTone(s: BookingStatus): "success" | "warning" | "neutral" {
  if (s === "Confirmed" || s === "Completed") return "success";
  if (s === "Pending") return "warning";
  return "neutral";
}

export default function BookingsPage() {
  const toast = useToast();
  const ask = useConfirm();
  const [items, setItems] = useState<BookingDto[] | null>(null);
  const setError = (m: string | null) => { if (m) toast.error(m); };
  const [reviewMenuFor, setReviewMenuFor] = useState<string | null>(null);
  const [sendingReviewFor, setSendingReviewFor] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await api.get<BookingDto[]>("/api/bookings"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load bookings.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: BookingStatus) {
    await api.patch(`/api/bookings/${id}/status`, { status });
    load();
  }

  async function handleDelete(id: string) {
    if (!await ask("Delete this booking?")) return;
    await api.delete(`/api/bookings/${id}`);
    load();
  }

  async function copyReviewLink(id: string) {
    try {
      const link = await api.get<string>(`/api/bookings/${id}/review-link`);
      await navigator.clipboard.writeText(link);
      toast.success("Review link copied to clipboard");
    } catch (err) {
      toast.error("Failed to get review link", err instanceof ApiError ? err.message : undefined);
    } finally {
      setReviewMenuFor(null);
    }
  }

  async function sendReviewEmail(id: string) {
    setSendingReviewFor(id);
    try {
      await api.post(`/api/bookings/${id}/send-review-request`);
      toast.success("Review request email sent");
    } catch (err) {
      toast.error("Failed to send email", err instanceof ApiError ? err.message : undefined);
    } finally {
      setSendingReviewFor(null);
      setReviewMenuFor(null);
    }
  }

  function exportToExcel() {
    if (!items) return;
    const header = ["Name", "Email", "Phone", "Services", "Preferred Date", "Preferred Time", "Status", "Notes", "Received"];
    const rows = items.map((b) => [
      b.name,
      b.email,
      b.phone,
      b.serviceNames.join("; "),
      new Date(b.preferredDate).toLocaleDateString("en-IN"),
      b.preferredTime ?? "",
      b.status,
      b.notes ?? "",
      new Date(b.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pending = items?.filter((b) => b.status === "Pending").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">Bookings</h1>
          <p className="mt-1 text-sm text-text-muted">
            Appointment requests from the website{pending > 0 && ` — ${pending} pending`}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportToExcel} disabled={!items || items.length === 0}>
            <Download size={15} /> Export CSV
          </Button>
          <Button variant="secondary" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </Button>
        </div>
      </div>


      <Card>
        <CardBody className="p-0">
          {items === null ? (
            <SkeletonTable />
          ) : items.length === 0 ? (
            <EmptyState label="No bookings yet — requests submitted on the website will appear here." />
          ) : (
            <Table>
              <TableHead columns={["Client", "Service", "Preferred date", "Contact", "Status", "Received", ""]} />
              <tbody>
              {items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <p className="font-medium text-text">{b.name}</p>
                    {b.notes && <p className="mt-0.5 max-w-[220px] truncate text-xs text-text-muted" title={b.notes}>{b.notes}</p>}
                  </TableCell>
                  <TableCell>{b.serviceNames.join(", ")}</TableCell>
                  <TableCell>
                    {new Date(b.preferredDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {b.preferredTime && <span className="text-text-muted"> · {b.preferredTime}</span>}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{b.phone}</p>
                    <p className="text-xs text-text-muted">{b.email}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value as BookingStatus)}
                        className="rounded-lg border border-border bg-surface px-1.5 py-1 text-xs text-text focus:border-primary focus:outline-none"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-text-muted">
                      {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {b.status === "Completed" && (
                        <div className="relative">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setReviewMenuFor(reviewMenuFor === b.id ? null : b.id)}
                          >
                            <MessageSquareText size={14} strokeWidth={1.75} />
                            Review
                          </Button>
                          {reviewMenuFor === b.id && (
                            <div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg">
                              <button
                                onClick={() => sendReviewEmail(b.id)}
                                disabled={sendingReviewFor === b.id}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text hover:bg-surface-hover disabled:opacity-60"
                              >
                                <Mail size={14} /> {sendingReviewFor === b.id ? "Sending…" : "Email link to customer"}
                              </button>
                              <button
                                onClick={() => copyReviewLink(b.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text hover:bg-surface-hover"
                              >
                                <Copy size={14} /> Copy link
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-status-danger-bg hover:text-status-danger-text"
                        aria-label="Delete booking"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
