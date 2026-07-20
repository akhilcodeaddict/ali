"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { BranchDto, BranchStatus, UpsertBranchDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { Pencil, Trash2, X, Building2 } from "lucide-react";

const empty: UpsertBranchDto = {
  name: "",
  addressLine: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
  email: "",
  managerName: "",
  openingHours: "",
  mapUrl: "",
  imageUrl: "",
  isHeadquarters: false,
  displayOrder: 0,
  status: "Open",
};

const statusOptions: BranchStatus[] = ["Open", "TemporarilyClosed", "Closed"];

function statusLabel(s: BranchStatus): string {
  return s === "TemporarilyClosed" ? "Temporarily closed" : s;
}

function statusTone(s: BranchStatus): "success" | "warning" | "neutral" {
  return s === "Open" ? "success" : s === "TemporarilyClosed" ? "warning" : "neutral";
}

export default function BranchesPage() {
  const [items, setItems] = useState<BranchDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertBranchDto>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"active" | "closed" | "all">("active");

  async function load() {
    try {
      setItems(await api.get<BranchDto[]>("/api/branches/all"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load branches.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(b: BranchDto) {
    setEditingId(b.id);
    setForm({
      name: b.name,
      addressLine: b.addressLine,
      city: b.city,
      state: b.state,
      postalCode: b.postalCode,
      country: b.country,
      phone: b.phone,
      email: b.email,
      managerName: b.managerName,
      openingHours: b.openingHours,
      mapUrl: b.mapUrl ?? "",
      imageUrl: b.imageUrl ?? "",
      isHeadquarters: b.isHeadquarters,
      displayOrder: b.displayOrder,
      status: b.status,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(empty);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) await api.put(`/api/branches/${editingId}`, form);
      else await api.post("/api/branches", form);
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save branch.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Close this branch? It will be hidden from the public site but can be reopened later.")) return;
    await api.delete(`/api/branches/${id}`);
    load();
  }

  const filteredItems = items?.filter((b) => {
    if (filter === "all") return true;
    if (filter === "closed") return b.status === "Closed";
    return b.status !== "Closed";
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-heading">Branches</h1>
        <p className="mt-1 text-sm text-text-muted">Business locations and offices.</p>
      </div>

      {error && (
        <p className="rounded-md bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">{error}</p>
      )}

      <Card>
        <CardHeader
          title={editingId ? "Edit branch" : "Add branch"}
          action={
            editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X size={14} strokeWidth={1.75} />
                Cancel
              </Button>
            )
          }
        />
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Branch name">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Manager name">
                <Input value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} />
              </Field>
              <Field label="Street address">
                <Input value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} />
              </Field>
              <Field label="City">
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </Field>
              <Field label="State / Province">
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </Field>
              <Field label="Postal code">
                <Input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
              </Field>
              <Field label="Country">
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as BranchStatus })}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Map URL">
                <Input value={form.mapUrl ?? ""} onChange={(e) => setForm({ ...form, mapUrl: e.target.value })} />
              </Field>
              <Field label="Image">
                <ImageUrlField value={form.imageUrl ?? ""} onChange={(url) => setForm({ ...form, imageUrl: url })} />
              </Field>
            </div>
            <Field label="Opening hours" helper="e.g. Mon–Fri 9:00 AM – 6:00 PM; Sat 10:00 AM – 2:00 PM">
              <Textarea
                rows={2}
                value={form.openingHours}
                onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
              />
            </Field>
            <div className="flex items-center gap-6">
              <Toggle
                checked={form.isHeadquarters}
                onChange={(v) => setForm({ ...form, isHeadquarters: v })}
                label="Headquarters"
              />
              <Field label="Display order">
                <Input
                  type="number"
                  className="w-24"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                />
              </Field>
            </div>
            <div>
              <Button type="submit">{editingId ? "Save changes" : "Add branch"}</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="All branches"
          description={items ? `${filteredItems?.length ?? 0} of ${items.length}` : undefined}
          action={
            <div className="flex items-center gap-1">
              {([
                { value: "active", label: "Active" },
                { value: "closed", label: "Closed" },
                { value: "all", label: "All" },
              ] as const).map((o) => (
                <button
                  key={o.value}
                  onClick={() => setFilter(o.value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    filter === o.value ? "bg-primary text-white" : "text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          }
        />
        {items === null && <SkeletonTable rows={4} cols={4} />}
        {items && filteredItems?.length === 0 && <EmptyState label="No branches in this view." />}
        {items && filteredItems && filteredItems.length > 0 && (
          <Table>
            <TableHead columns={["Branch", "Location", "Contact", "Status", ""]} />
            <tbody>
              {filteredItems.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <span className="flex items-center gap-1.5 font-semibold text-text">
                      <Building2 size={14} strokeWidth={1.75} className="text-text-helper" />
                      {b.name}
                    </span>
                    {b.managerName && (
                      <span className="block text-xs text-text-helper">Manager: {b.managerName}</span>
                    )}
                  </TableCell>
                  <TableCell muted>
                    {[b.city, b.state, b.country].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell muted>
                    {b.phone || b.email || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge tone={statusTone(b.status)}>{statusLabel(b.status)}</Badge>
                      {b.isHeadquarters && <Badge tone="warning">HQ</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(b)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(b.id)}>
                        <Trash2 size={14} strokeWidth={1.75} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
