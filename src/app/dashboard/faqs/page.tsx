"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { FaqDto, UpsertFaqDto } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ActiveFilter, ActiveFilterValue, filterByActive } from "@/components/ui/ActiveFilter";
import { useToast } from "@/lib/toast-context";
import { useConfirm } from "@/lib/confirm-context";
import { Drawer } from "@/components/ui/Drawer";
import { Plus, Pencil, Trash2 } from "lucide-react";

const empty: UpsertFaqDto = { question: "", answer: "", category: "", sortOrder: 0, isPublished: true };

export default function FaqsPage() {
  const toast = useToast();
  const ask = useConfirm();
  const [faqs, setFaqs] = useState<FaqDto[] | null>(null);
  const [form, setForm] = useState<UpsertFaqDto>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActiveFilterValue>("active");
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    try {
      setFaqs(await api.get<FaqDto[]>("/api/faqs/all"));
    } catch (err) {
      toast.error("Failed to load FAQs", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(faq: FaqDto) {
    setEditingId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? "",
      sortOrder: faq.sortOrder,
      isPublished: faq.isPublished,
    });
    setFormOpen(true);
  }

  function resetForm() { setEditingId(null); setForm(empty); }
  function closeDrawer() { setFormOpen(false); resetForm(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...form, category: form.category || null };
      if (editingId) await api.put(`/api/faqs/${editingId}`, payload);
      else await api.post("/api/faqs", payload);
      toast.success(editingId ? "FAQ updated" : "FAQ added");
      setFormOpen(false);
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save", err instanceof ApiError ? err.message : undefined);
    }
  }

  async function handleDelete(id: string) {
    if (!await ask("Unpublish this FAQ? It will be hidden from the website but can be published again later.")) return;
    try {
      await api.delete(`/api/faqs/${id}`);
      toast.success("FAQ unpublished");
      load();
    } catch (err) {
      toast.error("Failed to unpublish", err instanceof ApiError ? err.message : undefined);
    }
  }

  // The shared filter works on isActive; for FAQs that means published.
  const filteredFaqs = faqs
    ? filterByActive(faqs.map((f) => ({ ...f, isActive: f.isPublished })), filter).sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">FAQs</h1>
          <p className="mt-1 text-sm text-text-muted">Questions and answers shown on the website&apos;s FAQ page.</p>
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
        description="Questions and answers shown on the website's FAQ page."
        width="520px"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Question">
            <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
          </Field>
          <Field label="Answer">
            <Textarea rows={6} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Field label="Category" helper="Questions with the same category are grouped together">
                <Input
                  value={form.category ?? ""}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Booking"
                />
              </Field>
            </div>
            <Field label="Order">
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </Field>
          </div>
          <Toggle checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} label="Published" />
          <div>
            <Button type="submit">{editingId ? "Save changes" : "Add FAQ"}</Button>
          </div>
        </form>
      </Drawer>

      <Card>
        <CardHeader
          title="All FAQs"
          description={faqs ? `${filteredFaqs.length} of ${faqs.length}` : undefined}
          action={<ActiveFilter value={filter} onChange={setFilter} />}
        />
        {faqs === null && <SkeletonTable rows={4} cols={5} />}
        {faqs && filteredFaqs.length === 0 && <EmptyState label="No FAQs in this view." />}
        {faqs && filteredFaqs.length > 0 && (
          <Table>
            <TableHead columns={["Question", "Category", "Order", "Status", ""]} />
            <tbody>
              {filteredFaqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell>
                    <span className="font-semibold text-text">{faq.question}</span>
                  </TableCell>
                  <TableCell muted>{faq.category || "—"}</TableCell>
                  <TableCell muted>{faq.sortOrder}</TableCell>
                  <TableCell>
                    <Badge tone={faq.isPublished ? "success" : "neutral"}>{faq.isPublished ? "Published" : "Hidden"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(faq)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(faq.id)}>
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
