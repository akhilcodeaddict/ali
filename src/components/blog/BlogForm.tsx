"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { BlogDto, UpsertBlogDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { useToast } from "@/lib/toast-context";
import { ArrowLeft } from "lucide-react";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BlogForm({ initial }: { initial?: BlogDto }) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const dto: UpsertBlogDto = {
      title,
      slug,
      summary,
      content,
      author,
      category,
      coverImageUrl: coverImageUrl || null,
      isPublished,
    };

    try {
      if (isEdit && initial) {
        await api.put(`/api/blog/${initial.id}`, dto);
      } else {
        await api.post("/api/blog", dto);
      }
      toast.success(isEdit ? "Post updated" : "Post created");
      router.push("/dashboard/blog");
    } catch (err) {
      toast.error("Failed to save post", err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/blog"
            className="flex h-9 w-9 items-center justify-center rounded-[8px] text-text-muted hover:bg-section hover:text-text transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </Link>
          <div>
            <h1 className="text-[28px] font-bold text-text">
              {isEdit ? "Edit post" : "New post"}
            </h1>
            <p className="mt-1 text-sm text-text-muted">Write your article and preview it live.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={isPublished ? "success" : "neutral"}>
            {isPublished ? "Published" : "Draft"}
          </Badge>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save post"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Content" />
            <CardBody className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Title">
                  <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
                </Field>
                <Field label="Slug">
                  <Input
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                    required
                  />
                </Field>
                <Field label="Author">
                  <Input value={author} onChange={(e) => setAuthor(e.target.value)} required />
                </Field>
                <Field label="Category">
                  <CategorySelect module="blog" value={category} onChange={setCategory} />
                </Field>
              </div>

              <Field label="Cover image">
                <ImageUrlField value={coverImageUrl} onChange={setCoverImageUrl} />
              </Field>

              <Field label="Summary">
                <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} required />
              </Field>

              <Field label="Content">
                <RichTextEditor value={content} onChange={setContent} minHeight={320} />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Status" />
            <CardBody>
              <Toggle
                checked={isPublished}
                onChange={setIsPublished}
                label={isPublished ? "Published" : "Draft"}
              />
            </CardBody>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Preview" />
            <CardBody>
              {coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImageUrl}
                  alt=""
                  className="mb-3 h-32 w-full rounded-[4px] object-cover"
                />
              )}
              <p className="mb-1 text-[13px] font-semibold text-text-helper">
                {category || "Category"}
              </p>
              <p className="mb-3 text-lg font-bold text-text">{title || "Untitled post"}</p>
              <div
                className="editable-html max-h-[420px] min-w-0 overflow-auto rounded-[4px] border border-border bg-section p-4 text-sm text-text"
                dangerouslySetInnerHTML={{
                  __html: content || "<p class='text-text-helper'>Nothing to preview yet.</p>",
                }}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </form>
  );
}
