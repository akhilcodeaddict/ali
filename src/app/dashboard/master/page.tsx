"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { CategoryDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ActiveFilter, ActiveFilterValue, filterByActive } from "@/components/ui/ActiveFilter";
import { Pencil, Trash2, X, Plus } from "lucide-react";

const MODULES = [
  { key: "news", label: "News" },
  { key: "blog", label: "Blog" },
  { key: "documents", label: "Documents" },
  { key: "products", label: "Products" },
  { key: "faqs", label: "FAQs" },
  { key: "media", label: "Uploads" },
  { key: "gallery", label: "Gallery" },
];

const emptyForm = {
  name: "",
  module: "news",
  description: "",
  parentId: "" as string,
  isActive: true,
  displayOrder: 0,
};

export default function MasterCategoriesPage() {
  const [activeTab, setActiveTab] = useState("news");
  const [allCategories, setAllCategories] = useState<CategoryDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm, module: "news" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<ActiveFilterValue>("active");

  async function load() {
    try {
      setAllCategories(null);
      setAllCategories(await api.get<CategoryDto[]>("/api/categories/all"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load categories.");
    }
  }

  useEffect(() => { load(); }, []);

  const tabItemsRaw = allCategories?.filter((c) => c.module === activeTab) ?? null;
  const tabItems = tabItemsRaw ? filterByActive(tabItemsRaw, filter) : null;
  const parentOptions = allCategories?.filter((c) => c.module === activeTab && !c.parentId) ?? [];

  function startEdit(c: CategoryDto) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      module: c.module,
      description: c.description ?? "",
      parentId: c.parentId ?? "",
      isActive: c.isActive,
      displayOrder: c.displayOrder,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm, module: activeTab });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        module: activeTab,
        description: form.description || null,
        parentId: form.parentId || null,
        isActive: form.isActive,
        displayOrder: form.displayOrder,
      };
      if (editingId) await api.put(`/api/categories/${editingId}`, payload);
      else await api.post("/api/categories", payload);
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Deactivate category "${name}"? It will be hidden from active dropdowns but can be reactivated later.`)) return;
    try {
      await api.delete(`/api/categories/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to deactivate.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-heading">Master Data</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage categories used across modules — news, blog, products, and more.
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">{error}</p>
      )}

      {/* Module tabs */}
      <div className="flex gap-1 border-b border-border">
        {MODULES.map((m) => (
          <button
            key={m.key}
            onClick={() => { setActiveTab(m.key); resetForm(); setError(null); }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === m.key
                ? "border-b-2 border-primary text-primary"
                : "text-text-muted hover:text-text"
            }`}
          >
            {m.label}
            {allCategories && (
              <span className="ml-1.5 rounded-full bg-section px-1.5 py-0.5 text-[10px] font-semibold text-text-helper">
                {allCategories.filter((c) => c.module === m.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardHeader
          title={editingId ? "Edit category" : `Add ${MODULES.find((m) => m.key === activeTab)?.label} category`}
          action={
            editingId ? (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X size={14} strokeWidth={1.75} />
                Cancel
              </Button>
            ) : undefined
          }
        />
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Category name">
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Technology"
                  required
                />
              </Field>
              <Field label="Display order">
                <Input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                />
              </Field>
              {activeTab === "products" && (
                <Field label="Parent category" helper="Leave empty for a top-level category">
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]"
                  >
                    <option value="">— None (top-level) —</option>
                    {parentOptions.filter((p) => p.id !== editingId).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
            <Field label="Description (optional)">
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <Toggle
              checked={form.isActive}
              onChange={(v) => setForm({ ...form, isActive: v })}
              label="Active"
            />
            <div>
              <Button type="submit" disabled={saving}>
                <Plus size={15} strokeWidth={2} />
                {saving ? "Saving…" : editingId ? "Save changes" : "Add category"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader
          title={`${MODULES.find((m) => m.key === activeTab)?.label} categories`}
          description={tabItems ? `${tabItems.length} of ${tabItemsRaw?.length ?? 0}` : undefined}
          action={<ActiveFilter value={filter} onChange={setFilter} />}
        />
        {tabItems === null && <SkeletonTable rows={4} cols={4} />}
        {tabItems?.length === 0 && <EmptyState label="No categories in this view." />}
        {tabItems && tabItems.length > 0 && (
          <Table>
            <TableHead columns={["Name", "Parent", "Order", "Status", ""]} />
            <tbody>
              {tabItems.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="font-semibold text-text">{c.name}</span>
                    {c.description && (
                      <span className="block text-xs text-text-helper">{c.description}</span>
                    )}
                  </TableCell>
                  <TableCell muted>{c.parentName ?? "—"}</TableCell>
                  <TableCell muted>{c.displayOrder}</TableCell>
                  <TableCell>
                    <Badge tone={c.isActive ? "success" : "neutral"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(c)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(c.id, c.name)}>
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
