"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { BlogDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Drawer } from "@/components/ui/Drawer";
import { BlogDrawerForm } from "@/components/blog/BlogDrawerForm";
import { BlogView } from "@/components/blog/BlogView";
import { useToast } from "@/lib/toast-context";
import { Plus, Pencil, Trash2, Eye, X as XIcon } from "lucide-react";

type DrawerState = { mode: "add" } | { mode: "edit" | "view"; post: BlogDto } | null;

export default function BlogListPage() {
  const toast = useToast();
  const [posts, setPosts] = useState<BlogDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"published" | "draft" | "all">("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [drawer, setDrawer] = useState<DrawerState>(null);

  async function load() {
    try {
      setPosts(await api.get<BlogDto[]>("/api/blog/all"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load posts.");
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Unpublish this blog post? It will be hidden from the public site but can be republished later.")) return;
    try {
      await api.delete(`/api/blog/${id}`);
      toast.success("Post unpublished");
      load();
    } catch (err) {
      toast.error("Failed to unpublish", err instanceof ApiError ? err.message : undefined);
    }
  }

  const categories = useMemo(
    () => Array.from(new Set((posts ?? []).map((p) => p.category).filter(Boolean))).sort(),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    return posts?.filter((p) => {
      if (status === "draft" && p.isPublished) return false;
      if (status === "published" && !p.isPublished) return false;
      if (category && p.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.author.toLowerCase().includes(q)) return false;
      }
      if (dateFrom && (!p.publishedAt || p.publishedAt < dateFrom)) return false;
      if (dateTo && (!p.publishedAt || p.publishedAt > `${dateTo}T23:59:59`)) return false;
      return true;
    });
  }, [posts, status, category, search, dateFrom, dateTo]);

  function resetFilters() {
    setStatus("all");
    setSearch("");
    setCategory("");
    setDateFrom("");
    setDateTo("");
  }

  function closeDrawer() { setDrawer(null); }
  function handleSaved() { closeDrawer(); load(); }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">Blog</h1>
          <p className="mt-1 text-sm text-text-muted">Write and publish articles.</p>
        </div>
        <Button onClick={() => setDrawer({ mode: "add" })}>
          <Plus size={16} strokeWidth={2} />
          New post
        </Button>
      </div>

      <Card>
        <CardBody className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1.5 block text-xs font-medium text-text-helper">Search</label>
            <Input placeholder="Title or author…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="min-w-[180px]">
            <label className="mb-1.5 block text-xs font-medium text-text-helper">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-helper">From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-helper">To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="flex items-center gap-1 pb-0.5">
            {([
              { value: "all", label: "All" },
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
            ] as const).map((o) => (
              <button
                key={o.value}
                onClick={() => setStatus(o.value)}
                className={`rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                  status === o.value ? "bg-primary text-white" : "text-text-muted hover:bg-surface-hover"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <XIcon size={14} strokeWidth={1.75} /> Reset
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="All posts"
          description={posts ? `${filteredPosts?.length ?? 0} of ${posts.length}` : undefined}
        />
        {error && <CardBody className="text-sm text-red-600">{error}</CardBody>}
        {!error && posts === null && <SkeletonTable rows={4} cols={4} />}
        {!error && posts && filteredPosts?.length === 0 && <EmptyState label="No posts match these filters." />}
        {!error && posts && filteredPosts && filteredPosts.length > 0 && (
          <Table>
            <TableHead columns={["Title", "Author", "Category", "Status", ""]} />
            <tbody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <button
                      className="text-left font-semibold text-text hover:text-primary"
                      onClick={() => setDrawer({ mode: "view", post })}
                    >
                      {post.title}
                    </button>
                  </TableCell>
                  <TableCell muted>{post.author}</TableCell>
                  <TableCell muted>{post.category}</TableCell>
                  <TableCell>
                    <Badge tone={post.isPublished ? "success" : "neutral"}>
                      {post.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setDrawer({ mode: "view", post })}>
                        <Eye size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setDrawer({ mode: "edit", post })}>
                        <Pencil size={14} strokeWidth={1.75} />
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(post.id)}>
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

      <Drawer
        open={drawer?.mode === "add" || drawer?.mode === "edit"}
        onClose={closeDrawer}
        title={drawer?.mode === "edit" ? "Edit post" : "New post"}
        description="Write your article and publish it to the blog."
        width="720px"
      >
        {(drawer?.mode === "add" || drawer?.mode === "edit") && (
          <BlogDrawerForm
            initial={drawer.mode === "edit" ? drawer.post : undefined}
            onSaved={handleSaved}
            onCancel={closeDrawer}
          />
        )}
      </Drawer>

      <Drawer
        open={drawer?.mode === "view"}
        onClose={closeDrawer}
        title="Post preview"
        width="640px"
        footer={
          drawer?.mode === "view" ? (
            <>
              <Button variant="secondary" onClick={closeDrawer}>Close</Button>
              <Button onClick={() => setDrawer({ mode: "edit", post: drawer.post })}>
                <Pencil size={14} strokeWidth={1.75} /> Edit
              </Button>
            </>
          ) : undefined
        }
      >
        {drawer?.mode === "view" && <BlogView post={drawer.post} />}
      </Drawer>
    </div>
  );
}
