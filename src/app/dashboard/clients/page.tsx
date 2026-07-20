"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { ClientLogoDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { ActiveFilter, ActiveFilterValue, filterByActive } from "@/components/ui/ActiveFilter";
import { useToast } from "@/lib/toast-context";
import { Pencil, Trash2, X } from "lucide-react";

const empty = { name: "", logoUrl: "", order: 0, isActive: true };

export default function ClientsPage() {
  const toast = useToast();
  const [logos, setLogos] = useState<ClientLogoDto[] | null>(null);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActiveFilterValue>("active");

  async function load() {
    try {
      setLogos(await api.get<ClientLogoDto[]>("/api/clients/all"));
    } catch (err) {
      toast.error("Failed to load clients", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(logo: ClientLogoDto) {
    setEditingId(logo.id);
    setForm({ name: logo.name, logoUrl: logo.logoUrl, order: logo.order, isActive: logo.isActive });
  }

  function resetForm() { setEditingId(null); setForm(empty); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/api/clients/${editingId}`, form);
      else await api.post("/api/clients", form);
      toast.success(editingId ? "Client updated" : "Client added");
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save", err instanceof ApiError ? err.message : undefined);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deactivate this client logo? It will be hidden from the carousel but can be reactivated later.")) return;
    try {
      await api.delete(`/api/clients/${id}`);
      toast.success("Client deactivated");
      load();
    } catch (err) {
      toast.error("Failed to deactivate", err instanceof ApiError ? err.message : undefined);
    }
  }

  const filteredLogos = logos ? filterByActive(logos, filter) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-text">Clients</h1>
        <p className="mt-1 text-sm text-text-muted">Logos shown in the client carousel.</p>
      </div>

      <Card>
        <CardHeader
          title={editingId ? "Edit client" : "Add client"}
          action={editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X size={14} strokeWidth={1.75} /> Cancel
            </Button>
          )}
        />
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Name">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Order">
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="Logo">
              <ImageUrlField value={form.logoUrl} onChange={(url) => setForm({ ...form, logoUrl: url })} />
            </Field>
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
            <div>
              <Button type="submit">{editingId ? "Save changes" : "Add client"}</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="All clients"
          description={logos ? `${filteredLogos.length} of ${logos.length}` : undefined}
          action={<ActiveFilter value={filter} onChange={setFilter} />}
        />
        {logos === null && <SkeletonTable rows={4} cols={4} />}
        {logos && filteredLogos.length === 0 && <EmptyState label="No client logos in this view." />}
        {logos && filteredLogos.length > 0 && (
          <Table>
            <TableHead columns={["Name", "Order", "Status", ""]} />
            <tbody>
              {filteredLogos.map((logo) => (
                <TableRow key={logo.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logo.logoUrl} alt={logo.name} className="h-8 w-16 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <span className="font-semibold text-text">{logo.name}</span>
                    </div>
                  </TableCell>
                  <TableCell muted>{logo.order}</TableCell>
                  <TableCell>
                    <Badge tone={logo.isActive ? "success" : "neutral"}>{logo.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(logo)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(logo.id)}>
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
