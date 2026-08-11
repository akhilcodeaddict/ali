"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { FaqDto } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { useToast } from "@/lib/toast-context";
import { Drawer } from "@/components/ui/Drawer";
import { Plus, Pencil, Trash2 } from "lucide-react";

const emptyForm = { question: "", answer: "", category: "", sortOrder: 0, isPublished: true };

export default function FaqsPage() {
  const toast = useToast();
  const [items, setItems] = useState<FaqDto[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"published" | "hidden" | "all">("published");
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    try {
      setItems(await api.get<FaqDto[]>("/api/faqs/all"));
    } catch (err) {
      toast.error("Failed to load FAQs", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(f: FaqDto) {
    setEditingId(f.id);
    setForm({ question: f.question, answer: f.answer, category: f.category ?? "", sortOrder: f.sortOrder, isPublished: f.isPublished });
    setFormOpen(true);
  }

  function resetForm() { setEditingId(null); setForm(emptyForm); }
  function closeDrawer() { setFormOpen(false); resetForm(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, category: form.category || null };
      if (editingId) await api.put(`/api/faqs/${editingId}`, payload);
      else await api.post("/api/faqs", payload);
      toast.success(editingId ? "FAQ updated" : "FAQ created");
      setFormOpen(false);
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save FAQ", err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Unpublish this FAQ? It will be hidden from the public site but can be republished later.")) return;
    try {
      await api.delete(`/api/faqs/${id}`);
      toast.success("FAQ unpublished");
      load();
    } catch (err) {
      toast.error("Failed to unpublish", err instanceof ApiError ? err.message : undefined);
    }
  }

  const filteredItems = items?.filter((f) => {
    if (filter === "all") return true;
    if (filter === "hidden") return !f.isPublished;
    return f.isPublished;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-heading">FAQs</h1>
          <p className="mt-1 text-sm text-text-muted">Frequently asked questions shown on the public site.</p>
        </div>
        <Button onClick={() => { resetForm(); setFormOpen(true); }}>
          <Plus size={16} strokeWidth={2} />
          New FAQ
        </Button>
      </div>

      <Drawer
        open={formOpen}
        onClose={closeDrawer}
        title={editingId ? "Edit FAQ" : "Add FAQ"}
        description="Frequently asked questions shown on the public site."
        width="560px"
      >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Category">
                <CategorySelect module="faqs" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
              </Field>
              <Field label="Sort order">
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="Question">
              <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
            </Field>
            <Field label="Answer">
              <Textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
            </Field>
            <Toggle checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} label="Published" />
            <div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Add FAQ"}
              </Button>
            </div>
          </form>
      </Drawer>

      <Card>
        <CardHeader
          title="All FAQs"
          description={items ? `${filteredItems?.length ?? 0} of ${items.length}` : undefined}
          action={
            <div className="flex items-center gap-1">
              {([
                { value: "published", label: "Published" },
                { value: "hidden", label: "Hidden" },
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
        {items && filteredItems?.length === 0 && <EmptyState label="No FAQs in this view." />}
        {items && filteredItems && filteredItems.length > 0 && (
          <Table>
            <TableHead columns={["Question", "Category", "Order", "Status", ""]} />
            <tbody>
              {filteredItems.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <span className="font-semibold text-text">{f.question}</span>
                    <span className="block max-w-[360px] truncate text-xs text-text-helper">{f.answer}</span>
                  </TableCell>
                  <TableCell muted>{f.category ?? "—"}</TableCell>
                  <TableCell muted>{f.sortOrder}</TableCell>
                  <TableCell>
                    <Badge tone={f.isPublished ? "success" : "neutral"}>
                      {f.isPublished ? "Published" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(f)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(f.id)}>
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
