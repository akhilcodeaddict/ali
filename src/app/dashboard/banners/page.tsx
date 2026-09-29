"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { BannerDto, UpsertBannerDto } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { ActiveFilter, ActiveFilterValue, filterByActive } from "@/components/ui/ActiveFilter";
import { useToast } from "@/lib/toast-context";
import { Drawer } from "@/components/ui/Drawer";
import { Plus, Pencil, Trash2 } from "lucide-react";

const empty: UpsertBannerDto = { imageUrl: "", caption: "", displayOrder: 0, isActive: true };

export default function BannersPage() {
  const toast = useToast();
  const [banners, setBanners] = useState<BannerDto[] | null>(null);
  const [form, setForm] = useState<UpsertBannerDto>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActiveFilterValue>("active");
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    try {
      setBanners(await api.get<BannerDto[]>("/api/banners/all"));
    } catch (err) {
      toast.error("Failed to load banners", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(banner: BannerDto) {
    setEditingId(banner.id);
    setForm({
      imageUrl: banner.imageUrl,
      caption: banner.caption ?? "",
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
    });
    setFormOpen(true);
  }

  function resetForm() { setEditingId(null); setForm(empty); }
  function closeDrawer() { setFormOpen(false); resetForm(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...form, caption: form.caption || null };
      if (editingId) await api.put(`/api/banners/${editingId}`, payload);
      else await api.post("/api/banners", payload);
      toast.success(editingId ? "Banner updated" : "Banner added");
      setFormOpen(false);
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save", err instanceof ApiError ? err.message : undefined);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deactivate this banner? It will be hidden from the website but can be reactivated later.")) return;
    try {
      await api.delete(`/api/banners/${id}`);
      toast.success("Banner deactivated");
      load();
    } catch (err) {
      toast.error("Failed to deactivate", err instanceof ApiError ? err.message : undefined);
    }
  }

  const filteredBanners = banners ? filterByActive(banners, filter) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">Banners</h1>
          <p className="mt-1 text-sm text-text-muted">Scrolling image strip shown on the homepage.</p>
        </div>
        <Button onClick={() => { resetForm(); setFormOpen(true); }}>
          <Plus size={16} strokeWidth={2} />
          New banner
        </Button>
      </div>

      <Drawer
        open={formOpen}
        onClose={closeDrawer}
        title={editingId ? "Edit banner" : "Add banner"}
        description="Scrolling image strip shown on the homepage."
        width="520px"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Image">
            <ImageUrlField value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
          </Field>
          <Field label="Caption">
            <Input value={form.caption ?? ""} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
          </Field>
          <Field label="Order">
            <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
          </Field>
          <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
          <div>
            <Button type="submit">{editingId ? "Save changes" : "Add banner"}</Button>
          </div>
        </form>
      </Drawer>

      <Card>
        <CardHeader
          title="All banners"
          description={banners ? `${filteredBanners.length} of ${banners.length}` : undefined}
          action={<ActiveFilter value={filter} onChange={setFilter} />}
        />
        {banners === null && <SkeletonTable rows={4} cols={4} />}
        {banners && filteredBanners.length === 0 && <EmptyState label="No banners in this view." />}
        {banners && filteredBanners.length > 0 && (
          <Table>
            <TableHead columns={["Image", "Order", "Status", ""]} />
            <tbody>
              {filteredBanners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {banner.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={banner.imageUrl} alt={banner.caption ?? ""} className="h-8 w-16 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      )}
                      <span className="font-semibold text-text">{banner.caption || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell muted>{banner.displayOrder}</TableCell>
                  <TableCell>
                    <Badge tone={banner.isActive ? "success" : "neutral"}>{banner.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(banner)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(banner.id)}>
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
