"use client";

import { ContentBlock } from "@/lib/page-types";
import { blockRegistry } from "@/lib/blocks/registry";
import { mediaUrl } from "@/components/media/MediaGrid";

function HeadingBlock({ block }: { block: ContentBlock }) {
  const { level = 2, content = "", align = "left", color } = block.props;
  const Tag = `h${Math.min(Math.max(level, 1), 6)}` as keyof React.JSX.IntrinsicElements;
  const sizes: Record<number, string> = {
    1: "text-4xl", 2: "text-3xl", 3: "text-2xl", 4: "text-xl", 5: "text-lg", 6: "text-base",
  };
  return (
    <Tag
      className={`font-bold ${sizes[level] ?? "text-2xl"}`}
      style={{ textAlign: align, color: color || undefined }}
    >
      {content}
    </Tag>
  );
}

function ParagraphBlock({ block }: { block: ContentBlock }) {
  const { content = "", align = "left", fontSize } = block.props;
  return (
    <p
      style={{ textAlign: align, fontSize: fontSize || undefined }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

function ImageBlock({ block }: { block: ContentBlock }) {
  const { url, alt = "", caption, width = "100%", align = "center" } = block.props;
  if (!url) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border bg-section text-sm text-text-helper">
        No image URL set
      </div>
    );
  }
  const alignClass = align === "left" ? "mr-auto" : align === "right" ? "ml-auto" : "mx-auto";
  return (
    <figure className={alignClass} style={{ width }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mediaUrl(url)} alt={alt} className="w-full rounded-md" />
      {caption && (
        <figcaption className="mt-1.5 text-center text-[13px] text-text-helper">{caption}</figcaption>
      )}
    </figure>
  );
}

function ButtonBlock({ block }: { block: ContentBlock }) {
  const { text = "", url = "#", variant = "primary", size = "md", fullWidth } = block.props;
  const sizeClass = size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm";
  const variantClass =
    variant === "primary"
      ? "bg-primary text-white hover:bg-primary-dark"
      : "bg-surface text-text border border-border hover:bg-section";
  return (
    <a
      href={url}
      onClick={(e) => e.preventDefault()}
      className={`inline-flex items-center justify-center rounded-md font-semibold transition-colors ${sizeClass} ${variantClass}`}
      style={{ width: fullWidth ? "100%" : undefined }}
    >
      {text}
    </a>
  );
}

function QuoteBlock({ block }: { block: ContentBlock }) {
  const { text = "", author } = block.props;
  return (
    <blockquote className="border-l-[3px] border-primary pl-4 text-lg italic text-text-muted">
      {text}
      {author && <footer className="mt-1 text-sm not-italic text-text-helper">— {author}</footer>}
    </blockquote>
  );
}

function SpacerBlock({ block }: { block: ContentBlock }) {
  return <div style={{ height: Number(block.props.height) || 40 }} />;
}

function DividerBlock({ block }: { block: ContentBlock }) {
  const { color = "#e3e8ee", margin = 24 } = block.props;
  return <hr style={{ borderColor: color, marginTop: margin, marginBottom: margin }} />;
}

function EmbedBlock({ block }: { block: ContentBlock }) {
  const { embedUrl, aspectRatio = "16/9" } = block.props;
  if (!embedUrl) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border bg-section text-sm text-text-helper">
        No embed URL set
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-md" style={{ aspectRatio }}>
      <iframe src={embedUrl} className="h-full w-full" allowFullScreen title="Embedded media" />
    </div>
  );
}

function HtmlBlock({ block }: { block: ContentBlock }) {
  return <div dangerouslySetInnerHTML={{ __html: block.props.html ?? "" }} />;
}

export function BlockContent({
  block,
  children,
}: {
  block: ContentBlock;
  children?: React.ReactNode;
}) {
  switch (block.type) {
    case "heading":
      return <HeadingBlock block={block} />;
    case "paragraph":
      return <ParagraphBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "button":
      return <ButtonBlock block={block} />;
    case "quote":
      return <QuoteBlock block={block} />;
    case "spacer":
      return <SpacerBlock block={block} />;
    case "divider":
      return <DividerBlock block={block} />;
    case "embed":
      return <EmbedBlock block={block} />;
    case "html":
      return <HtmlBlock block={block} />;
    case "section": {
      const { backgroundColor, padding = "48px 24px", maxWidth = "1080px" } = block.props;
      return (
        <section style={{ backgroundColor: backgroundColor || undefined, padding }}>
          <div style={{ maxWidth, margin: "0 auto" }} className="flex flex-col gap-4">
            {children}
          </div>
        </section>
      );
    }
    case "grid": {
      const { columns = 2, gap = "24px" } = block.props;
      return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
          {children}
        </div>
      );
    }
    default:
      return (
        <div className="rounded-md bg-[var(--color-status-warning-bg)] px-3 py-2 text-sm text-[var(--color-status-warning-text)]">
          Unknown block type: <code>{block.type}</code>
        </div>
      );
  }
}

/** Read-only recursive renderer (used for preview / public rendering). */
export function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks || blocks.length === 0) {
    return <p className="py-10 text-center text-sm text-text-helper">No content yet.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block) => (
        <BlockContent key={block.id} block={block}>
          {block.children && <BlockRenderer blocks={block.children} />}
        </BlockContent>
      ))}
    </div>
  );
}

export function blockLabel(type: string): string {
  return blockRegistry[type]?.label ?? type;
}
