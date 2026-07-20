"use client";

import { API_URL } from "@/lib/api";
import { MediaFile } from "@/lib/media-types";
import clsx from "clsx";

export function mediaUrl(path?: string | null): string {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_URL}${path}`;
}

export function MediaGrid({
  files,
  selectedId,
  onSelect,
}: {
  files: MediaFile[];
  selectedId?: string | null;
  onSelect: (file: MediaFile) => void;
}) {
  if (files.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-text-helper">
        No images found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {files.map((file) => (
        <button
          key={file.id}
          type="button"
          onClick={() => onSelect(file)}
          className={clsx(
            "group overflow-hidden rounded-lg border bg-white text-left transition-all cursor-pointer",
            selectedId === file.id
              ? "border-primary shadow-[var(--shadow-focus)]"
              : "border-border hover:border-border hover:shadow-[var(--shadow-card)]"
          )}
        >
          <div className="relative aspect-square bg-section">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaUrl(file.thumbnailUrl ?? file.originalUrl)}
              alt={file.altText}
              loading="lazy"
              className={clsx(
                "h-full w-full object-cover",
                file.isDeleted && "opacity-40 grayscale"
              )}
            />
            {file.isDeleted && (
              <span className="absolute left-2 top-2 rounded-full bg-status-danger-bg px-2 py-0.5 text-[10px] font-semibold text-status-danger-text">
                Deleted
              </span>
            )}
          </div>
          <div className="px-2.5 py-2">
            <p className="truncate text-xs font-semibold text-text">{file.fileName}</p>
            <p className="truncate text-[11px] text-text-helper">
              {file.width > 0 ? `${file.width}×${file.height} · ` : ""}
              {file.category}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
