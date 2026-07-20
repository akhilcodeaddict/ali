export interface MediaFile {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  width: number;
  height: number;
  originalUrl: string;
  largeUrl?: string | null;
  mediumUrl?: string | null;
  thumbnailUrl?: string | null;
  altText: string;
  description?: string | null;
  category: string;
  isDeleted: boolean;
  createdAt: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
