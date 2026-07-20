"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/toast-context";
import { Pencil, Trash2, X, GripVertical } from "lucide-react";

export interface MenuItemDto {
  id: string;
  label: string;
  url: string;
  order: number;
  openInNewTab: boolean;
  isActive: boolean;
  parentId?: string | null;
  menuKey: string;
  children?: MenuItemDto[];
}

interface MenuItemForm {
  label: string;
  url: string;
  order: number;
  openInNewTab: boolean;
  isActive: boolean;
  parentId: string;
  menuKey: string;
}

const MENU_KEYS = [
  { key: "header", label: "Header navigation" },
  { key: "footer-col1", label: "Footer — Column 1" },
  { key: "footer-col2", label: "Footer — Column 2" },
  { key: "footer-col3", label: "Footer — Column 3" },
  { key: "mobile", label: "Mobile navigation" },
];

const emptyForm: MenuItemForm = {
  label: "",
  url: "",
  order: 0,
  openInNewTab: false,
  isActive: true,
  parentId: "",
  menuKey: "header",
};

export default function MenuPage() {
  const toast = useToast();
  const [activeMenu, setActiveMenu] = useState("header");
  const [items, setItems] = useState<MenuItemDto[] | null>(null);
  const [form, setForm] = useState<MenuItemForm>({ ...emptyForm, menuKey: "header" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load(menuKey = activeMenu) {
    try {
      setItems(null);
      setItems(await api.get<MenuItemDto[]>(`/api/menu?key=${encodeURIComponent(menuKey)}`));
    } catch (err) {
      toast.error("Failed to load menu", err instanceof ApiError ? err.message : undefined);
      setItems([]);
    }
  }

  useEffect(() => { load(activeMenu); }, [activeMenu]);

  const topLevelItems = items?.filter((i) => !i.parentId) ?? [];

  function startEdit(item: MenuItemDto) {
    setEditingId(item.id);
    setForm({
      label: item.label,
      url: item.url,
      order: item.order,
      openInNewTab: item.openInNewTab,
      isActive: item.isActive,
      parentId: item.parentId ?? "",
      menuKey: item.menuKey,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm, menuKey: activeMenu });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, parentId: form.parentId || null, menuKey: activeMenu };
      if (editingId) await api.put(`/api/menu/${editingId}`, payload);
      else await api.post("/api/menu", payload);
      toast.success(editingId ? "Item updated" : "Item added");
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save", err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`Delete "${label}"?`)) return;
    try {
      await api.delete(`/api/menu/${id}`);
      toast.success("Item deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete", err instanceof ApiError ? err.message : undefined);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-heading">Menu Manager</h1>
        <p className="mt-1 text-sm text-text-muted">Configure navigation menus shown on the frontend.</p>
      </div>

      {/* Menu tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {MENU_KEYS.map((m) => (
          <button
            key={m.key}
            onClick={() => { setActiveMenu(m.key); resetForm(); }}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeMenu === m.key
                ? "border-b-2 border-primary text-primary"
                : "text-text-muted hover:text-text"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader
          title={editingId ? "Edit item" : "Add item"}
          action={editingId ? (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X size={14} strokeWidth={1.75} /> Cancel
            </Button>
          ) : undefined}
        />
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Label">
                <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required placeholder="e.g. About Us" />
              </Field>
              <Field label="URL">
                <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required placeholder="/about or https://…" />
              </Field>
              {topLevelItems.length > 0 && (
                <Field label="Parent item" helper="Leave empty for top-level">
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]"
                  >
                    <option value="">— None (top-level) —</option>
                    {topLevelItems.filter((i) => i.id !== editingId).map((i) => (
                      <option key={i.id} value={i.id}>{i.label}</option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="Order">
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="flex items-center gap-6">
              <Toggle checked={form.openInNewTab} onChange={(v) => setForm({ ...form, openInNewTab: v })} label="Open in new tab" />
              <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
            </div>
            <div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Add item"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={MENU_KEYS.find((m) => m.key === activeMenu)?.label ?? "Menu items"}
          description={items ? `${items.length} item(s)` : undefined}
        />
        {items === null && <SkeletonTable rows={4} cols={4} />}
        {items?.length === 0 && <EmptyState label="No menu items yet. Add one above." />}
        {items && items.length > 0 && (
          <Table>
            <TableHead columns={["", "Label", "URL", "Status", ""]} />
            <tbody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <GripVertical size={14} className="text-text-helper cursor-grab" />
                  </TableCell>
                  <TableCell>
                    {item.parentId && <span className="mr-1 text-text-helper">└</span>}
                    <span className="font-medium text-text">{item.label}</span>
                  </TableCell>
                  <TableCell muted>
                    <span className="truncate block max-w-[240px]">{item.url}</span>
                    {item.openInNewTab && <span className="text-[10px] text-text-helper">Opens in new tab</span>}
                  </TableCell>
                  <TableCell>
                    <Badge tone={item.isActive ? "success" : "neutral"}>
                      {item.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(item)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(item.id, item.label)}>
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
