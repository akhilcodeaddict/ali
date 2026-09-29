"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { MediaFile } from "@/lib/media-types";
import { MediaGrid } from "@/components/media/MediaGrid";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, X } from "lucide-react";

export function MediaPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  /** Receives the picked file's backend-relative path (medium rendition if available)
   *  and the file itself. Kept relative — not resolved against this admin session's
   *  API host — so the value stays portable no matter where it's later rendered
   *  (the salon site resolves it against its own API host at render time). */
  onPick: (url: string, file: MediaFile) => void;
}) {
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    api.get<MediaFile[]>(`/api/media${params}`).then(setFiles).catch(() => setFiles([]));
  }, [open, search]);

  if (!open) return null;

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", fileList[0]);
      form.append("category", "General");
      const uploaded = await api.post<MediaFile>("/api/media/upload", form);
      onPick(uploaded.mediumUrl ?? uploaded.originalUrl, uploaded);
      onClose();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/25" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[80vh] w-[760px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-border bg-surface shadow-[var(--shadow-card-hover)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[17px] font-bold text-text">Choose image</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={13} strokeWidth={1.75} />
              {uploading ? "Uploading…" : "Upload new"}
            </Button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-helper hover:bg-section hover:text-text cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>

        <div className="border-b border-border px-5 py-3">
          <Input
            placeholder="Search images…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {files === null ? (
            <p className="text-sm text-text-muted">Loading…</p>
          ) : (
            <MediaGrid
              files={files}
              onSelect={(file) => {
                onPick(file.mediumUrl ?? file.originalUrl, file);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

/** Input with a "Browse" button that opens the media picker. */
export function ImageUrlField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div className="flex gap-2">
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or pick from library" />
      <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
        Browse
      </Button>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={(url) => onChange(url)} />
    </div>
  );
}
