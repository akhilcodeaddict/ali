"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { BlogDto, UpsertBlogDto } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { useToast } from "@/lib/toast-context";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BlogDrawerForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: BlogDto;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(initial);
  const toast = useToast();

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
      onSaved();
    } catch (err) {
      toast.error("Failed to save post", err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form id="blog-drawer-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Title">
        <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} required autoFocus />
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
      <div className="grid grid-cols-2 gap-4">
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
        <RichTextEditor value={content} onChange={setContent} minHeight={260} />
      </Field>
      <Toggle checked={isPublished} onChange={setIsPublished} label={isPublished ? "Published" : "Draft"} />

      <div className="mt-2 flex items-center justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save changes" : "Create post"}</Button>
      </div>
    </form>
  );
}
