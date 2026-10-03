"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { AwardDto, UpsertAwardDto } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { ActiveFilter, ActiveFilterValue, filterByActive } from "@/components/ui/ActiveFilter";
import { useToast } from "@/lib/toast-context";
import { Drawer } from "@/components/ui/Drawer";
import { Plus, Pencil, Trash2 } from "lucide-react";

const empty: UpsertAwardDto = { name: "", description: "", logoUrl: "", photoUrl: "", displayOrder: 0, isActive: true };

export default function AwardsPage() {
  const toast = useToast();
  const [awards, setAwards] = useState<AwardDto[] | null>(null);
  const [form, setForm] = useState<UpsertAwardDto>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActiveFilterValue>("active");
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    try {
      setAwards(await api.get<AwardDto[]>("/api/awards/all"));
    } catch (err) {
      toast.error("Failed to load awards", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(award: AwardDto) {
    setEditingId(award.id);
    setForm({
      name: award.name,
      description: award.description ?? "",
      logoUrl: award.logoUrl ?? "",
      photoUrl: award.photoUrl ?? "",
      displayOrder: award.displayOrder,
      isActive: award.isActive,
    });
    setFormOpen(true);
  }

  function resetForm() { setEditingId(null); setForm(empty); }
  function closeDrawer() { setFormOpen(false); resetForm(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...form, logoUrl: form.logoUrl || null, photoUrl: form.photoUrl || null };
      if (editingId) await api.put(`/api/awards/${editingId}`, payload);
      else await api.post("/api/awards", payload);
      toast.success(editingId ? "Award updated" : "Award added");
      setFormOpen(false);
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save", err instanceof ApiError ? err.message : undefined);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deactivate this award? It will be hidden from the website but can be reactivated later.")) return;
    try {
      await api.delete(`/api/awards/${id}`);
      toast.success("Award deactivated");
      load();
    } catch (err) {
      toast.error("Failed to deactivate", err instanceof ApiError ? err.message : undefined);
    }
  }

  const filteredAwards = awards ? filterByActive(awards, filter) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">Awards</h1>
          <p className="mt-1 text-sm text-text-muted">Awards and recognitions shown on the website.</p>
        </div>
        <Button onClick={() => { resetForm(); setFormOpen(true); }}>
          <Plus size={16} strokeWidth={2} />
          New award
        </Button>
      </div>

      <Drawer
        open={formOpen}
        onClose={closeDrawer}
        title={editingId ? "Edit award" : "Add award"}
        description="Awards and recognitions shown on the website."
        width="520px"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Order">
              <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Description" helper="Shown next to the award on the website">
            <Textarea
              rows={3}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Recognised for storytelling excellence in South India wedding photography"
            />
          </Field>
          <Field label="Logo">
            <ImageUrlField value={form.logoUrl ?? ""} onChange={(url) => setForm({ ...form, logoUrl: url })} />
          </Field>
          <Field label="Photo">
            <ImageUrlField value={form.photoUrl ?? ""} onChange={(url) => setForm({ ...form, photoUrl: url })} />
          </Field>
          <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
          <div>
            <Button type="submit">{editingId ? "Save changes" : "Add award"}</Button>
          </div>
        </form>
      </Drawer>

      <Card>
        <CardHeader
          title="All awards"
          description={awards ? `${filteredAwards.length} of ${awards.length}` : undefined}
          action={<ActiveFilter value={filter} onChange={setFilter} />}
        />
        {awards === null && <SkeletonTable rows={4} cols={4} />}
        {awards && filteredAwards.length === 0 && <EmptyState label="No awards in this view." />}
        {awards && filteredAwards.length > 0 && (
          <Table>
            <TableHead columns={["Name", "Order", "Status", ""]} />
            <tbody>
              {filteredAwards.map((award) => (
                <TableRow key={award.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {award.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={award.logoUrl} alt={award.name} className="h-8 w-16 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      )}
                      <span className="font-semibold text-text">{award.name}</span>
                    </div>
                  </TableCell>
                  <TableCell muted>{award.displayOrder}</TableCell>
                  <TableCell>
                    <Badge tone={award.isActive ? "success" : "neutral"}>{award.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(award)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(award.id)}>
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
