"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { MediaFile } from "@/lib/media-types";
import { MediaGrid, mediaUrl } from "@/components/media/MediaGrid";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, X } from "lucide-react";

export function MediaPicker({
  open,
  onClose,
  onPick,
  currentUrl,
}: {
  open: boolean;
  onClose: () => void;
  /** Receives the picked file's backend-relative path (medium rendition if available)
   *  and the file itself. Kept relative — not resolved against this admin session's
   *  API host — so the value stays portable no matter where it's later rendered
   *  (the salon site resolves it against its own API host at render time). */
  onPick: (url: string, file: MediaFile) => void;
  /** The URL currently set on the parent field — used to pre-highlight the matching image. */
  currentUrl?: string;
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

  // Match the currently-set URL to a file id so MediaGrid can ring it.
  const selectedId = useMemo(() => {
    if (!currentUrl || !files) return null;
    const norm = (u: string) => u.replace(/^https?:\/\/[^/]+/, "");
    const normalizedCurrent = norm(currentUrl);
    return (
      files.find((f) => {
        const candidates = [f.mediumUrl, f.originalUrl, f.thumbnailUrl].filter(Boolean) as string[];
        return candidates.some((c) => norm(mediaUrl(c)) === normalizedCurrent || norm(c) === normalizedCurrent);
      })?.id ?? null
    );
  }, [currentUrl, files]);

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

  // Portalled to <body>: the picker is opened from inside a Drawer, whose slide-in
  // animation sets a `transform`. That makes it a containing block for fixed
  // positioning, which would otherwise offset this dialog off-screen.
  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-black/25" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[110] flex max-h-[80vh] w-[760px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-border bg-surface shadow-[var(--shadow-card-hover)]">
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
              selectedId={selectedId}
              onSelect={(file) => {
                onPick(file.mediumUrl ?? file.originalUrl, file);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </>,
    document.body,
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
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={(url) => onChange(url)} currentUrl={value} />
    </div>
  );
}
