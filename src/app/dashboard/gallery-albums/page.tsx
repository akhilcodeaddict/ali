"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { CategoryDto, GalleryAlbumDto, UpsertGalleryAlbumDto, UpsertGalleryAlbumImageDto } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ImageUrlField, MediaPicker } from "@/components/media/MediaPicker";
import { ActiveFilter, ActiveFilterValue, filterByActive } from "@/components/ui/ActiveFilter";
import { useToast } from "@/lib/toast-context";
import { useConfirm } from "@/lib/confirm-context";
import { Drawer } from "@/components/ui/Drawer";
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, Images } from "lucide-react";
import { mediaUrl } from "@/components/media/MediaGrid";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const emptyImage: UpsertGalleryAlbumImageDto = {
  imageUrl: "",
  caption: "",
  displayOrder: 0,
  isLocationDivider: false,
  locationText: "",
};

const emptyForm: UpsertGalleryAlbumDto = {
  slug: "",
  title: "",
  coupleNames: "",
  coverImageUrl: "",
  heroImageUrl: "",
  location: "",
  eventDate: "",
  story: "",
  photographerCredits: "",
  filmmakerCredits: "",
  editorCredits: "",
  categoryId: null,
  displayOrder: 0,
  isActive: true,
  images: [],
};

export default function GalleryAlbumsPage() {
  const toast = useToast();
  const ask = useConfirm();
  const [albums, setAlbums] = useState<GalleryAlbumDto[] | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [form, setForm] = useState<UpsertGalleryAlbumDto>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActiveFilterValue>("active");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [multiPickerOpen, setMultiPickerOpen] = useState(false);

  async function load() {
    try {
      const [a, c] = await Promise.all([
        api.get<GalleryAlbumDto[]>("/api/gallery-albums/all"),
        api.get<CategoryDto[]>("/api/categories/all"),
      ]);
      setAlbums(a);
      setCategories(c.filter((x) => x.module === "gallery-albums"));
    } catch (err) {
      toast.error("Failed to load gallery albums", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(album: GalleryAlbumDto) {
    setEditingId(album.id);
    setForm({
      slug: album.slug,
      title: album.title,
      coupleNames: album.coupleNames,
      coverImageUrl: album.coverImageUrl ?? "",
      heroImageUrl: album.heroImageUrl ?? "",
      location: album.location ?? "",
      eventDate: album.eventDate ?? "",
      story: album.story ?? "",
      photographerCredits: album.photographerCredits ?? "",
      filmmakerCredits: album.filmmakerCredits ?? "",
      editorCredits: album.editorCredits ?? "",
      categoryId: album.categoryId ?? null,
      displayOrder: album.displayOrder,
      isActive: album.isActive,
      images: album.images
        .slice()
        .sort((x, y) => x.displayOrder - y.displayOrder)
        .map((img) => ({
          imageUrl: img.imageUrl,
          caption: img.caption ?? "",
          displayOrder: img.displayOrder,
          isLocationDivider: img.isLocationDivider,
          locationText: img.locationText ?? "",
        })),
    });
    setFormOpen(true);
  }

  function resetForm() { setEditingId(null); setForm(emptyForm); }
  function closeDrawer() { setFormOpen(false); resetForm(); }

  function updateImage(i: number, patch: Partial<UpsertGalleryAlbumImageDto>) {
    const next = [...form.images];
    next[i] = { ...next[i], ...patch };
    setForm({ ...form, images: next });
  }

  function addImage() {
    setForm({ ...form, images: [...form.images, { ...emptyImage, displayOrder: form.images.length }] });
  }

  /** One card per picked image, appended after the existing ones. */
  function addImages(urls: string[]) {
    // An untouched blank card left by "Add image" would only get in the way.
    const kept = form.images.filter((img) => img.imageUrl.trim() || img.caption || img.isLocationDivider);
    const added = urls.map((imageUrl) => ({ ...emptyImage, imageUrl }));
    setForm({ ...form, images: [...kept, ...added].map((img, idx) => ({ ...img, displayOrder: idx })) });
  }

  function removeImage(i: number) {
    setForm({ ...form, images: form.images.filter((_, idx) => idx !== i).map((img, idx) => ({ ...img, displayOrder: idx })) });
  }

  function moveImage(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= form.images.length) return;
    const next = [...form.images];
    [next[i], next[j]] = [next[j], next[i]];
    setForm({ ...form, images: next.map((img, idx) => ({ ...img, displayOrder: idx })) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        coverImageUrl: form.coverImageUrl || null,
        heroImageUrl: form.heroImageUrl || null,
        location: form.location || null,
        eventDate: form.eventDate || null,
        story: form.story || null,
        photographerCredits: form.photographerCredits || null,
        filmmakerCredits: form.filmmakerCredits || null,
        editorCredits: form.editorCredits || null,
        images: form.images.map((img, idx) => ({
          ...img,
          displayOrder: idx,
          caption: img.caption || null,
          locationText: img.isLocationDivider ? (img.locationText || null) : null,
        })),
      };
      if (editingId) await api.put(`/api/gallery-albums/${editingId}`, payload);
      else await api.post("/api/gallery-albums", payload);
      toast.success(editingId ? "Album updated" : "Album added");
      setFormOpen(false);
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save", err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!await ask("Deactivate this album? It will be hidden from the public gallery but can be reactivated later.")) return;
    try {
      await api.delete(`/api/gallery-albums/${id}`);
      toast.success("Album deactivated");
      load();
    } catch (err) {
      toast.error("Failed to deactivate", err instanceof ApiError ? err.message : undefined);
    }
  }

  const filteredAlbums = albums ? filterByActive(albums, filter) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">Gallery Albums</h1>
          <p className="mt-1 text-sm text-text-muted">
            Wedding portfolio albums shown on the public site. Categories are managed under Master Data →
            Gallery Albums.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setFormOpen(true); }}>
          <Plus size={16} strokeWidth={2} />
          New album
        </Button>
      </div>

      <Drawer
        open={formOpen}
        onClose={closeDrawer}
        title={editingId ? "Edit album" : "Add album"}
        description="Wedding portfolio album shown on the public gallery."
        width="760px"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Title">
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })}
                required
              />
            </Field>
            <Field label="Slug">
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </Field>
            <Field label="Couple names">
              <Input value={form.coupleNames} onChange={(e) => setForm({ ...form, coupleNames: e.target.value })} required />
            </Field>
            <Field label="Location">
              <Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Field>
            <Field label="Event date">
              <Input type="date" value={form.eventDate ? form.eventDate.slice(0, 10) : ""} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
            </Field>
            <Field label="Category">
              <select
                value={form.categoryId ?? ""}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value || null })}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Cover image">
            <ImageUrlField value={form.coverImageUrl ?? ""} onChange={(url) => setForm({ ...form, coverImageUrl: url })} />
          </Field>
          <Field label="Hero image">
            <ImageUrlField value={form.heroImageUrl ?? ""} onChange={(url) => setForm({ ...form, heroImageUrl: url })} />
          </Field>

          <Field label="Story">
            <RichTextEditor value={form.story ?? ""} onChange={(html) => setForm({ ...form, story: html })} minHeight={200} />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Photographer credits">
              <Input value={form.photographerCredits ?? ""} onChange={(e) => setForm({ ...form, photographerCredits: e.target.value })} />
            </Field>
            <Field label="Filmmaker credits">
              <Input value={form.filmmakerCredits ?? ""} onChange={(e) => setForm({ ...form, filmmakerCredits: e.target.value })} />
            </Field>
            <Field label="Editor credits">
              <Input value={form.editorCredits ?? ""} onChange={(e) => setForm({ ...form, editorCredits: e.target.value })} />
            </Field>
          </div>

          <div className="flex items-center gap-6">
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
            <Field label="Display order">
              <Input
                type="number"
                className="w-24"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
              />
            </Field>
          </div>

          <div className="rounded-[8px] border border-border bg-section/60 p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text">Album images</p>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setMultiPickerOpen(true)}>
                  <Images size={14} strokeWidth={1.75} />
                  Add multiple
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={addImage}>
                  <Plus size={14} strokeWidth={1.75} />
                  Add image
                </Button>
              </div>
            </div>
            {/* Mounted only while open so each visit starts with nothing ticked. */}
            {multiPickerOpen && (
              <MediaPicker
                open
                multiple
                onClose={() => setMultiPickerOpen(false)}
                onPick={() => {}}
                onPickMany={(items) => addImages(items.map((x) => x.url))}
              />
            )}

            {form.images.length === 0 && (
              <p className="text-xs text-text-helper">No images added yet.</p>
            )}

            <div className="flex flex-col gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="rounded-lg border border-border bg-surface p-3 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(i, -1)}
                        disabled={i === 0}
                        className="flex h-6 w-6 items-center justify-center rounded text-text-helper hover:bg-section disabled:opacity-30"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(i, 1)}
                        disabled={i === form.images.length - 1}
                        className="flex h-6 w-6 items-center justify-center rounded text-text-helper hover:bg-section disabled:opacity-30"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <ImageUrlField value={img.imageUrl} onChange={(url) => updateImage(i, { imageUrl: url })} />
                      <Input
                        value={img.caption ?? ""}
                        onChange={(e) => updateImage(i, { caption: e.target.value })}
                        placeholder="Caption (optional)"
                      />
                      <label className="flex items-center gap-2 text-[13px] text-text">
                        <input
                          type="checkbox"
                          checked={img.isLocationDivider}
                          onChange={(e) => updateImage(i, { isLocationDivider: e.target.checked })}
                          className="h-4 w-4 accent-primary"
                        />
                        Location divider
                      </label>
                      {img.isLocationDivider && (
                        <Input
                          value={img.locationText ?? ""}
                          onChange={(e) => updateImage(i, { locationText: e.target.value })}
                          placeholder="Location text, e.g. Udaipur, Rajasthan"
                        />
                      )}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(i)}>
                      <X size={14} strokeWidth={1.75} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Add album"}
            </Button>
          </div>
        </form>
      </Drawer>

      <Card>
        <CardHeader
          title="All albums"
          description={albums ? `${filteredAlbums.length} of ${albums.length}` : undefined}
          action={<ActiveFilter value={filter} onChange={setFilter} />}
        />
        {albums === null && <SkeletonTable rows={4} cols={6} />}
        {albums && filteredAlbums.length === 0 && <EmptyState label="No albums in this view." />}
        {albums && filteredAlbums.length > 0 && (
          <Table>
            <TableHead columns={["Title", "Couple", "Category", "Order", "Status", ""]} />
            <tbody>
              {filteredAlbums.map((album) => (
                <TableRow key={album.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {album.coverImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl(album.coverImageUrl)} alt={album.title} className="h-10 w-14 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      )}
                      <span className="font-semibold text-text">{album.title}</span>
                    </div>
                  </TableCell>
                  <TableCell muted>{album.coupleNames}</TableCell>
                  <TableCell muted>{album.categoryName ?? "—"}</TableCell>
                  <TableCell muted>{album.displayOrder}</TableCell>
                  <TableCell>
                    <Badge tone={album.isActive ? "success" : "neutral"}>{album.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(album)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(album.id)}>
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
