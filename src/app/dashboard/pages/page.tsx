"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { PageDetail, PageListItem, PageStatus } from "@/lib/page-types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Field } from "@/components/ui/Input";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

const statusTone: Record<PageStatus, "success" | "warning" | "neutral"> = {
  Draft: "neutral",
  Review: "warning",
  Scheduled: "warning",
  Published: "success",
  Archived: "neutral",
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function PagesListPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function load() {
    try {
      setPages(await api.get<PageListItem[]>("/api/pages"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load pages.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Archive this page? It will no longer be served.")) return;
    await api.delete(`/api/pages/${id}`);
    load();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      const page = await api.post<PageDetail>("/api/pages", {
        title: newTitle,
        slug: newSlug || undefined,
        content: { version: "1.0", blocks: [] },
        showInMenu: true,
        displayOrder: 0,
      });
      router.push(`/dashboard/pages/${page.id}`);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Failed to create page.");
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">Pages</h1>
          <p className="mt-1 text-sm text-text-muted">
            Block-based pages with drafts, versions, and scheduled publishing.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} strokeWidth={2} />
          New page
        </Button>
      </div>

      <Card>
        <CardHeader title="All pages" description={pages ? `${pages.length} total` : undefined} />
        {error && <CardBody className="text-sm text-red-600">{error}</CardBody>}
        {!error && pages === null && (
          <SkeletonTable rows={4} cols={4} />
        )}
        {!error && pages && pages.length === 0 && (
          <EmptyState label="No pages yet. Create your first one." />
        )}
        {!error && pages && pages.length > 0 && (
          <Table>
            <TableHead columns={["Title", "Slug", "Status", "Views", "Version", ""]} />
            <tbody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <span className="font-semibold text-text">{page.title}</span>
                  </TableCell>
                  <TableCell muted>/{page.slug}</TableCell>
                  <TableCell>
                    <Badge tone={statusTone[page.status]}>{page.status}</Badge>
                  </TableCell>
                  <TableCell muted>
                    <span className="inline-flex items-center gap-1">
                      <Eye size={13} strokeWidth={1.75} />
                      {page.viewCount}
                    </span>
                  </TableCell>
                  <TableCell muted>v{page.currentVersion}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/pages/${page.id}`}>
                        <Button variant="secondary" size="sm">
                          <Pencil size={14} strokeWidth={1.75} />
                          Edit
                        </Button>
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(page.id)}>
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

      {createOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setCreateOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface shadow-[var(--shadow-card-hover)]">
            <form onSubmit={handleCreate}>
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-[17px] font-bold text-text">New page</h2>
              </div>
              <div className="flex flex-col gap-4 px-5 py-5">
                <Field label="Title">
                  <Input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      if (!slugTouched) setNewSlug(slugify(e.target.value));
                    }}
                    required
                  />
                </Field>
                <Field label="Slug" helper="URL path, e.g. about-us">
                  <Input
                    value={newSlug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setNewSlug(slugify(e.target.value));
                    }}
                  />
                </Field>
                {createError && (
                  <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">
                    {createError}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
                <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !newTitle}>
                  {creating ? "Creating…" : "Create & edit"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
