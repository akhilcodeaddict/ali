import { BlogDto } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export function BlogView({ post }: { post: BlogDto }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Badge tone={post.isPublished ? "success" : "neutral"}>
          {post.isPublished ? "Published" : "Draft"}
        </Badge>
        <span className="text-sm text-text-helper">{post.category}</span>
      </div>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImageUrl} alt="" className="h-48 w-full rounded-[8px] object-cover" />
      )}

      <div>
        <h3 className="text-[20px] font-bold text-text">{post.title}</h3>
        <p className="mt-1 text-sm text-text-muted">By {post.author} · /{post.slug}</p>
      </div>

      <p className="text-sm text-text-muted">{post.summary}</p>

      <div
        className="editable-html max-h-[420px] min-w-0 overflow-auto rounded-[8px] border border-border bg-section p-4 text-sm text-text"
        dangerouslySetInnerHTML={{ __html: post.content || "<p>No content.</p>" }}
      />
    </div>
  );
}
