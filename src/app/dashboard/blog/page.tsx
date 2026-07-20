"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { BlogDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"published" | "draft" | "all">("published");

  async function load() {
    try {
      setPosts(await api.get<BlogDto[]>("/api/blog/all"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load posts.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Unpublish this blog post? It will be hidden from the public site but can be republished later.")) return;
    await api.delete(`/api/blog/${id}`);
    load();
  }

  const filteredPosts = posts?.filter((p) => {
    if (filter === "all") return true;
    if (filter === "draft") return !p.isPublished;
    return p.isPublished;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">Blog</h1>
          <p className="mt-1 text-sm text-text-muted">Write and publish articles.</p>
        </div>
        <Link href="/dashboard/blog/new">
          <Button>
            <Plus size={16} strokeWidth={2} />
            New post
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader
          title="All posts"
          description={posts ? `${filteredPosts?.length ?? 0} of ${posts.length}` : undefined}
          action={
            <div className="flex items-center gap-1">
              {([
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "all", label: "All" },
              ] as const).map((o) => (
                <button
                  key={o.value}
                  onClick={() => setFilter(o.value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    filter === o.value ? "bg-primary text-white" : "text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          }
        />
        {error && <CardBody className="text-sm text-red-600">{error}</CardBody>}
        {!error && posts === null && (
          <SkeletonTable rows={4} cols={4} />
        )}
        {!error && posts && filteredPosts?.length === 0 && (
          <EmptyState label="No posts in this view." />
        )}
        {!error && posts && filteredPosts && filteredPosts.length > 0 && (
          <Table>
            <TableHead columns={["Title", "Author", "Category", "Status", ""]} />
            <tbody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <span className="font-semibold text-text">{post.title}</span>
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
                      <Link href={`/dashboard/blog/${post.id}`}>
                        <Button variant="secondary" size="sm">
                          <Pencil size={14} strokeWidth={1.75} />
                          Edit
                        </Button>
                      </Link>
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
    </div>
  );
}
