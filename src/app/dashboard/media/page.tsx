"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { MediaFile, formatFileSize } from "@/lib/media-types";
import { MediaGrid, mediaUrl } from "@/components/media/MediaGrid";
import { Card, CardBody } from "@/components/ui/Card";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Upload, X, Trash2, RotateCcw, Copy } from "lucide-react";

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (showDeleted) params.set("includeDeleted", "true");
      const [f, c] = await Promise.all([
        api.get<MediaFile[]>(`/api/media?${params}`),
        api.get<string[]>("/api/media/categories"),
      ]);
      setFiles(f);
      setCategories(c);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load media.");
    }
  }, [category, search, showDeleted]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(fileList)) {
        const form = new FormData();
        form.append("file", file);
        form.append("category", category || "General");
        await api.post("/api/media/upload", form);
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function saveMeta() {
    if (!selected) return;
    const updated = await api.put<MediaFile>(`/api/media/${selected.id}`, {
      altText: selected.altText,
      description: selected.description ?? null,
      category: selected.category,
    });
    setSelected(updated);
    load();
  }

  async function softDelete() {
    if (!selected) return;
    await api.delete(`/api/media/${selected.id}`);
    setSelected(null);
    load();
  }

  async function restore() {
    if (!selected) return;
    await api.post(`/api/media/${selected.id}/restore`);
    setSelected({ ...selected, isDeleted: false });
    load();
  }

  async function purge() {
    if (!selected) return;
    if (!window.confirm("Permanently delete this image and all its sizes? This cannot be undone.")) return;
    await api.delete(`/api/media/${selected.id}/permanent`);
    setSelected(null);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">Media</h1>
          <p className="mt-1 text-sm text-text-muted">
            Upload and organize images. Thumbnails and web sizes are generated automatically.
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload size={16} strokeWidth={2} />
          {uploading ? "Uploading…" : "Upload images"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <CardBody className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Search by name or alt text…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Toggle checked={showDeleted} onChange={setShowDeleted} label="Show deleted" />
          <span className="ml-auto text-sm text-text-helper">
            {files ? `${files.length} file(s)` : "Loading…"}
          </span>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardBody>
            {files === null ? (
              <div className="animate-pulse grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-[8px] bg-border/70" />
                ))}
              </div>
            ) : (
              <MediaGrid files={files} selectedId={selected?.id} onSelect={setSelected} />
            )}
          </CardBody>
        </Card>

        {selected && (
          <Card className="h-fit lg:sticky lg:top-8">
            <CardBody className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <h2 className="text-[15px] font-bold text-text">Image details</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-text-helper hover:text-text cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(selected.mediumUrl ?? selected.originalUrl)}
                alt={selected.altText}
                className="w-full rounded-lg border border-border"
              />

              <div className="text-[13px] text-text-muted">
                <p className="font-semibold text-text">{selected.fileName}</p>
                <p>
                  {selected.width > 0 && `${selected.width}×${selected.height} · `}
                  {formatFileSize(selected.fileSize)} · {selected.contentType}
                </p>
              </div>

              <Field label="Alt text" helper="Used for accessibility and SEO">
                <Input
                  value={selected.altText}
                  onChange={(e) => setSelected({ ...selected, altText: e.target.value })}
                />
              </Field>
              <Field label="Category">
                <Input
                  value={selected.category}
                  onChange={(e) => setSelected({ ...selected, category: e.target.value })}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  rows={2}
                  value={selected.description ?? ""}
                  onChange={(e) => setSelected({ ...selected, description: e.target.value })}
                />
              </Field>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigator.clipboard.writeText(mediaUrl(selected.originalUrl))}
              >
                <Copy size={13} strokeWidth={1.75} />
                Copy URL
              </Button>

              <div className="flex items-center gap-2 border-t border-border pt-4">
                <Button size="sm" onClick={saveMeta}>
                  Save details
                </Button>
                {selected.isDeleted ? (
                  <>
                    <Button variant="secondary" size="sm" onClick={restore}>
                      <RotateCcw size={13} strokeWidth={1.75} />
                      Restore
                    </Button>
                    <Button variant="danger" size="sm" onClick={purge}>
                      <Trash2 size={13} strokeWidth={1.75} />
                      Purge
                    </Button>
                  </>
                ) : (
                  <Button variant="danger" size="sm" onClick={softDelete}>
                    <Trash2 size={13} strokeWidth={1.75} />
                    Delete
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
