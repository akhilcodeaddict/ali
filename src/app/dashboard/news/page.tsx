"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { NewsDto, UpsertNewsDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { useToast } from "@/lib/toast-context";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { Pencil, Trash2, X } from "lucide-react";

const empty: UpsertNewsDto = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  category: "",
  coverImageUrl: "",
  isFeatured: false,
  isPublished: false,
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewsPage() {
  const toast = useToast();
  const [items, setItems] = useState<NewsDto[] | null>(null);
  const [form, setForm] = useState<UpsertNewsDto>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [filter, setFilter] = useState<"published" | "draft" | "all">("published");

  async function load() {
    try {
      setItems(await api.get<NewsDto[]>("/api/news/all"));
    } catch (err) {
      toast.error("Failed to load news", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(n: NewsDto) {
    setEditingId(n.id);
    setSlugTouched(true);
    setForm({
      title: n.title,
      slug: n.slug,
      summary: n.summary,
      content: n.content,
      category: n.category,
      coverImageUrl: n.coverImageUrl ?? "",
      isFeatured: n.isFeatured,
      isPublished: n.isPublished,
    });
  }

  function resetForm() {
    setEditingId(null);
    setSlugTouched(false);
    setForm(empty);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/api/news/${editingId}`, form);
      else await api.post("/api/news", form);
      toast.success(editingId ? "News item updated" : "News item created");
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save", err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Unpublish this news item? It will be hidden from the public site but can be republished later.")) return;
    try {
      await api.delete(`/api/news/${id}`);
      toast.success("News item unpublished");
      load();
    } catch (err) {
      toast.error("Failed to unpublish", err instanceof ApiError ? err.message : undefined);
    }
  }

  const filteredItems = items?.filter((n) => {
    if (filter === "all") return true;
    if (filter === "draft") return !n.isPublished;
    return n.isPublished;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-heading">News</h1>
        <p className="mt-1 text-sm text-text-muted">News items and press releases.</p>
      </div>

      <Card>
        <CardHeader
          title={editingId ? "Edit news item" : "Add news item"}
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
              <Field label="Title">
                <Input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
                  }}
                  required
                />
              </Field>
              <Field label="Slug">
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm({ ...form, slug: slugify(e.target.value) });
                  }}
                  required
                />
              </Field>
              <Field label="Category">
                <CategorySelect module="news" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
              </Field>
              <Field label="Cover image">
                <ImageUrlField value={form.coverImageUrl ?? ""} onChange={(url) => setForm({ ...form, coverImageUrl: url })} />
              </Field>
            </div>
            <Field label="Summary">
              <Textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </Field>
            <Field label="Content">
              <Textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
            </Field>
            <div className="flex items-center gap-6">
              <Toggle checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} label="Published" />
              <Toggle checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} label="Featured" />
            </div>
            <div>
              <Button type="submit">{editingId ? "Save changes" : "Add news item"}</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="All news"
          description={items ? `${filteredItems?.length ?? 0} of ${items.length}` : undefined}
          action={
            <div className="flex items-center gap-1">
              {([
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
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
        {items === null && <SkeletonTable rows={4} cols={5} />}
        {items && filteredItems?.length === 0 && <EmptyState label="No news items in this view." />}
        {items && filteredItems && filteredItems.length > 0 && (
          <Table>
            <TableHead columns={["Title", "Category", "Status", "Published", ""]} />
            <tbody>
              {filteredItems.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>
                    <span className="font-semibold text-text">{n.title}</span>
                    <span className="block text-xs text-text-helper">/{n.slug}</span>
                  </TableCell>
                  <TableCell muted>{n.category || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge tone={n.isPublished ? "success" : "neutral"}>
                        {n.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {n.isFeatured && <Badge tone="warning">Featured</Badge>}
                    </div>
                  </TableCell>
                  <TableCell muted>
                    {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(n)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(n.id)}>
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
