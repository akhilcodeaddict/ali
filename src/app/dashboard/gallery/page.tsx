"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { GalleryItemDto, GalleryMediaType, UpsertGalleryItemDto, CategoryDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/toast-context";
import { useConfirm } from "@/lib/confirm-context";
import { mediaUrl } from "@/components/media/MediaGrid";
import { ActiveFilter, ActiveFilterValue, filterByActive } from "@/components/ui/ActiveFilter";
import { Pencil, Trash2, X, Plus, Upload, Film, Image as ImageIcon } from "lucide-react";

const emptyForm: UpsertGalleryItemDto = {
  title: "",
  mediaUrl: "",
  mediaType: "Image",
  categoryId: "",
  displayOrder: 0,
  isActive: true,
  width: null,
  height: null,
  thumbnailUrl: null,
};

export default function GalleryPage() {
  const toast = useToast();
  const ask = useConfirm();
  const [items, setItems] = useState<GalleryItemDto[] | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [form, setForm] = useState<UpsertGalleryItemDto>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<ActiveFilterValue>("active");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const [g, c] = await Promise.all([
        api.get<GalleryItemDto[]>("/api/gallery/all"),
        api.get<CategoryDto[]>("/api/categories/all"),
      ]);
      setItems(g);
      setCategories(c.filter((x) => x.module === "gallery"));
    } catch (err) {
      toast.error("Failed to load gallery", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(item: GalleryItemDto) {
    setEditingId(item.id);
    setForm({
      title: item.title ?? "",
      mediaUrl: item.mediaUrl,
      mediaType: item.mediaType,
      categoryId: item.categoryId,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
      width: item.width ?? null,
      height: item.height ?? null,
      thumbnailUrl: item.thumbnailUrl ?? null,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", fileList[0]);
      const res = await api.post<{ url: string; mediaType: GalleryMediaType; width?: number | null; height?: number | null }>("/api/gallery/upload", body);
      setForm((f) => ({ ...f, mediaUrl: res.url, mediaType: res.mediaType, width: res.width ?? null, height: res.height ?? null }));
      toast.success("File uploaded");
    } catch (err) {
      toast.error("Upload failed", err instanceof ApiError ? err.message : undefined);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleThumbnailUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploadingThumb(true);
    try {
      const body = new FormData();
      body.append("file", fileList[0]);
      const res = await api.post<{ originalUrl: string }>("/api/media/upload", body);
      setForm((f) => ({ ...f, thumbnailUrl: res.originalUrl }));
      toast.success("Thumbnail uploaded");
    } catch (err) {
      toast.error("Thumbnail upload failed", err instanceof ApiError ? err.message : undefined);
    } finally {
      setUploadingThumb(false);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.mediaUrl) {
      toast.error("Please upload or paste a media URL first.");
      return;
    }
    if (!form.categoryId) {
      toast.error("Please choose a category.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, title: form.title || null };
      if (editingId) await api.put(`/api/gallery/${editingId}`, payload);
      else await api.post("/api/gallery", payload);
      toast.success(editingId ? "Gallery item updated" : "Gallery item added");
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save", err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!await ask("Deactivate this gallery item? It will be hidden from the public gallery but can be reactivated later.")) return;
    try {
      await api.delete(`/api/gallery/${id}`);
      toast.success("Gallery item deactivated");
      load();
    } catch (err) {
      toast.error("Failed to deactivate", err instanceof ApiError ? err.message : undefined);
    }
  }

  const filteredItems = items ? filterByActive(items, filter) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-heading">Gallery</h1>
        <p className="mt-1 text-sm text-text-muted">
          Upload photos and videos, organized by category, for the public gallery page. Categories are
          managed under Master Data → Gallery.
        </p>
      </div>

      {categories.length === 0 && items !== null && (
        <p className="rounded-lg bg-status-warning-bg px-3 py-2 text-sm text-status-warning-text">
          No gallery categories yet. Add one under Master Data → Gallery before uploading media.
        </p>
      )}

      <Card>
        <CardHeader
          title={editingId ? "Edit gallery item" : "Add gallery item"}
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
            <Field label="Image or video" helper="Upload a file, or paste a URL directly below">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload size={13} strokeWidth={1.75} />
                  {uploading ? "Uploading…" : "Upload file"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
                {form.mediaUrl && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                    {form.mediaType === "Video" ? <Film size={13} /> : <ImageIcon size={13} />}
                    {form.mediaType}
                  </span>
                )}
              </div>
              <Input
                className="mt-2"
                value={form.mediaUrl}
                onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
                placeholder="https://… (image or video URL)"
              />
            </Field>

            {form.mediaUrl && (
              <div className="overflow-hidden rounded-lg border border-border" style={{ maxWidth: 240 }}>
                {form.mediaType === "Video" ? (
                  <video src={mediaUrl(form.mediaUrl)} className="h-40 w-full object-cover" controls muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(form.mediaUrl)} alt="Preview" className="h-40 w-full object-cover" />
                )}
              </div>
            )}

            {form.mediaType === "Video" && (
              <Field label="Video thumbnail (optional)" helper="Shown before/instead of playing the video — recommended for films">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => thumbInputRef.current?.click()}
                    disabled={uploadingThumb}
                  >
                    <Upload size={13} strokeWidth={1.75} />
                    {uploadingThumb ? "Uploading…" : "Upload thumbnail"}
                  </Button>
                  {form.thumbnailUrl && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, thumbnailUrl: null }))}
                      className="text-[11px] text-status-danger-text hover:underline"
                    >
                      Remove
                    </button>
                  )}
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleThumbnailUpload(e.target.files)}
                  />
                </div>
                <Input
                  className="mt-2"
                  value={form.thumbnailUrl ?? ""}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value || null })}
                  placeholder="https://… (thumbnail image URL)"
                />
                {form.thumbnailUrl && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border" style={{ maxWidth: 160 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(form.thumbnailUrl)} alt="Thumbnail preview" className="h-24 w-full object-cover" />
                  </div>
                )}
              </Field>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Media type">
                <select
                  value={form.mediaType}
                  onChange={(e) => setForm({ ...form, mediaType: e.target.value as GalleryMediaType })}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                </select>
              </Field>
              <Field label="Category">
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  required
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  <option value="" disabled>Choose a category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Title / caption (optional)">
                <Input
                  value={form.title ?? ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Bridal Suite Interior"
                />
              </Field>
              <Field label="Display order">
                <Input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Width (px)" helper="Auto-filled after uploading an image; set manually for pasted URLs">
                <Input
                  type="number"
                  value={form.width ?? ""}
                  onChange={(e) => setForm({ ...form, width: e.target.value ? Number(e.target.value) : null })}
                  placeholder="e.g. 1600"
                />
              </Field>
              <Field label="Height (px)" helper="Controls how tall/wide the tile shows in the public gallery">
                <Input
                  type="number"
                  value={form.height ?? ""}
                  onChange={(e) => setForm({ ...form, height: e.target.value ? Number(e.target.value) : null })}
                  placeholder="e.g. 2000"
                />
              </Field>
            </div>

            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />

            <div>
              <Button type="submit" disabled={saving}>
                <Plus size={15} strokeWidth={2} />
                {saving ? "Saving…" : editingId ? "Save changes" : "Add to gallery"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Gallery items"
          description={items ? `${filteredItems.length} of ${items.length}` : undefined}
          action={<ActiveFilter value={filter} onChange={setFilter} />}
        />
        {items === null && <SkeletonTable rows={4} cols={5} />}
        {items && filteredItems.length === 0 && <EmptyState label="No gallery items in this view." />}
        {items && filteredItems.length > 0 && (
          <Table>
            <TableHead columns={["Preview", "Title", "Category", "Type", "Status", ""]} />
            <tbody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="h-12 w-16 overflow-hidden rounded-lg border border-border bg-section">
                      {item.mediaType === "Video" ? (
                        item.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={mediaUrl(item.thumbnailUrl)} alt={item.title ?? ""} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-black/10">
                            <Film size={18} className="text-text-muted" />
                          </div>
                        )
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl(item.mediaUrl)} alt={item.title ?? ""} className="h-full w-full object-cover" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.title || <span className="text-text-helper">—</span>}</TableCell>
                  <TableCell muted>{item.categoryName ?? "—"}</TableCell>
                  <TableCell muted>{item.mediaType}</TableCell>
                  <TableCell>
                    <Badge tone={item.isActive ? "success" : "neutral"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(item)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
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
