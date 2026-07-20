"use client";

import { use, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { BlogDto } from "@/lib/types";
import { BlogForm } from "@/components/blog/BlogForm";
import { SkeletonBlogForm } from "@/components/ui/Skeleton";

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<BlogDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<BlogDto>(`/api/blog/by-id/${id}`)
      .then(setPost)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load post."));
  }, [id]);

  if (error) return <p className="rounded-md bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">{error}</p>;
  if (!post) return <SkeletonBlogForm />;

  return <BlogForm initial={post} />;
}
