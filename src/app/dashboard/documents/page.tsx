"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError, API_URL } from "@/lib/api";
import { DocumentDto, UpdateDocumentDto } from "@/lib/types";
import { formatFileSize } from "@/lib/media-types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { useToast } from "@/lib/toast-context";
import { Pencil, Trash2, X, Download, UploadCloud } from "lucide-react";

const emptyMeta: UpdateDocumentDto = {
  title: "",
  description: "",
  category: "General",
  author: "",
  isPublished: true,
};

export default function DocumentsPage() {
  const toast = useToast();
  const [items, setItems] = useState<DocumentDto[] | null>(null);
  const [meta, setMeta] = useState<UpdateDocumentDto>(emptyMeta);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      setItems(await api.get<DocumentDto[]>("/api/documents/all"));
    } catch (err) {
      toast.error("Failed to load documents", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(d: DocumentDto) {
    setEditingId(d.id);
    setMeta({
      title: d.title,
      description: d.description ?? "",
      category: d.category,
      author: d.author,
      isPublished: d.isPublished,
    });
  }

  function resetForm() {
    setEditingId(null);
    setMeta(emptyMeta);
    if (fileRef.current) fileRef.current.value = "";
    if (replaceFileRef.current) replaceFileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    try {
      if (editingId) {
        await api.put(`/api/documents/${editingId}`, meta);
        const newFile = replaceFileRef.current?.files?.[0];
        if (newFile) {
          const fd = new FormData();
          fd.append("file", newFile);
          await api.post(`/api/documents/${editingId}/file`, fd);
        }
        toast.success("Document updated");
      } else {
        const file = fileRef.current?.files?.[0];
        if (!file) {
          toast.warning("No file selected", "Choose a file to upload.");
          return;
        }
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", meta.title || file.name);
        if (meta.description) fd.append("description", meta.description);
        fd.append("category", meta.category);
        fd.append("author", meta.author);
        fd.append("isPublished", String(meta.isPublished));
        await api.post("/api/documents/upload", fd);
        toast.success("Document uploaded");
      }
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save document", err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this document and its file?")) return;
    try {
      await api.delete(`/api/documents/${id}`);
      toast.success("Document deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete", err instanceof ApiError ? err.message : undefined);
    }
  }

  async function handleDownload(d: DocumentDto) {
    try {
      const res = await api.get<{ url: string }>(`/api/documents/${d.id}/download`);
      window.open(`${API_URL}${res.url}`, "_blank");
      load();
    } catch (err) {
      toast.error("Download failed", err instanceof ApiError ? err.message : undefined);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-heading">Documents</h1>
        <p className="mt-1 text-sm text-text-muted">Downloadable files: reports, guides, policies.</p>
      </div>

      <Card>
        <CardHeader
          title={editingId ? "Edit document" : "Upload document"}
          action={
            editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X size={14} strokeWidth={1.75} />
                Cancel
              </Button>
            )
          }
        />
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Title">
                <Input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} required={!!editingId} />
              </Field>
              <Field label="Category">
                <CategorySelect module="documents" value={meta.category} onChange={(v) => setMeta({ ...meta, category: v })} />
              </Field>
              <Field label="Author">
                <Input value={meta.author} onChange={(e) => setMeta({ ...meta, author: e.target.value })} />
              </Field>
              <Field
                label={editingId ? "Replace file (optional — bumps version)" : "File"}
                helper="PDF, Word, Excel, PowerPoint, TXT, CSV or ZIP"
              >
                <input
                  ref={editingId ? replaceFileRef : fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                  className="block w-full text-sm text-text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary-light file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary-light/70"
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                rows={2}
                value={meta.description ?? ""}
                onChange={(e) => setMeta({ ...meta, description: e.target.value })}
              />
            </Field>
            <div className="flex items-center gap-6">
              <Toggle checked={meta.isPublished} onChange={(v) => setMeta({ ...meta, isPublished: v })} label="Published" />
            </div>
            <div>
              <Button type="submit" disabled={uploading}>
                <UploadCloud size={15} strokeWidth={1.75} />
                {uploading ? "Saving…" : editingId ? "Save changes" : "Upload document"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="All documents" description={items ? `${items.length} total` : undefined} />
        {items === null && <SkeletonTable rows={4} cols={4} />}
        {items && items.length === 0 && <EmptyState label="No documents yet." />}
        {items && items.length > 0 && (
          <Table>
            <TableHead columns={["Document", "Category", "Size", "Downloads", "Status", ""]} />
            <tbody>
              {items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <span className="font-semibold text-text">{d.title}</span>
                    <span className="block text-xs text-text-helper">
                      {d.fileName} · v{d.version}
                    </span>
                  </TableCell>
                  <TableCell muted>{d.category || "—"}</TableCell>
                  <TableCell muted>{formatFileSize(d.fileSize)}</TableCell>
                  <TableCell muted>{d.downloadCount}</TableCell>
                  <TableCell>
                    <Badge tone={d.isPublished ? "success" : "neutral"}>
                      {d.isPublished ? "Published" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleDownload(d)} title="Download">
                        <Download size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => startEdit(d)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(d.id)}>
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
