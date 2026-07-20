import { ContentBlock, newBlockId } from "@/lib/page-types";

export type PropFieldType =
  | "string"
  | "text"
  | "richtext"
  | "number"
  | "boolean"
  | "select"
  | "color"
  | "url"
  | "image";

export interface PropField {
  type: PropFieldType;
  label: string;
  helper?: string;
  options?: Array<{ value: string | number; label: string }>;
}

export type PropsSchema = Record<string, PropField>;

export interface BlockDefinition {
  label: string;
  description: string;
  category: "text" | "media" | "layout" | "advanced";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultProps: Record<string, any>;
  propsSchema: PropsSchema;
  /** Layout blocks contain children */
  container?: boolean;
}

export const blockRegistry: Record<string, BlockDefinition> = {
  heading: {
    label: "Heading",
    description: "Section title (H1–H6)",
    category: "text",
    defaultProps: { level: 2, content: "Heading text", align: "left", color: "" },
    propsSchema: {
      level: {
        type: "select",
        label: "Level",
        options: [1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: `H${n}` })),
      },
      content: { type: "text", label: "Text" },
      align: {
        type: "select",
        label: "Alignment",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ],
      },
      color: { type: "color", label: "Color" },
    },
  },

  paragraph: {
    label: "Paragraph",
    description: "Body text (supports inline HTML)",
    category: "text",
    defaultProps: { content: "Write something…", align: "left", fontSize: "16px" },
    propsSchema: {
      content: { type: "richtext", label: "Content" },
      align: {
        type: "select",
        label: "Alignment",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
          { value: "justify", label: "Justify" },
        ],
      },
      fontSize: { type: "string", label: "Font size", helper: "CSS value, e.g. 16px" },
    },
  },

  image: {
    label: "Image",
    description: "Single image with caption",
    category: "media",
    defaultProps: { url: "", alt: "", caption: "", width: "100%", align: "center" },
    propsSchema: {
      url: { type: "image", label: "Image" },
      alt: { type: "string", label: "Alt text", helper: "For accessibility and SEO" },
      caption: { type: "string", label: "Caption" },
      width: { type: "string", label: "Width", helper: "CSS value, e.g. 100% or 480px" },
      align: {
        type: "select",
        label: "Alignment",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ],
      },
    },
  },

  button: {
    label: "Button",
    description: "Call-to-action link",
    category: "text",
    defaultProps: { text: "Click me", url: "#", variant: "primary", size: "md", fullWidth: false },
    propsSchema: {
      text: { type: "string", label: "Label" },
      url: { type: "url", label: "Link URL" },
      variant: {
        type: "select",
        label: "Style",
        options: [
          { value: "primary", label: "Primary" },
          { value: "secondary", label: "Secondary" },
        ],
      },
      size: {
        type: "select",
        label: "Size",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ],
      },
      fullWidth: { type: "boolean", label: "Full width" },
    },
  },

  quote: {
    label: "Quote",
    description: "Pull quote with attribution",
    category: "text",
    defaultProps: { text: "Quote text", author: "" },
    propsSchema: {
      text: { type: "text", label: "Quote" },
      author: { type: "string", label: "Author" },
    },
  },

  spacer: {
    label: "Spacer",
    description: "Vertical whitespace",
    category: "layout",
    defaultProps: { height: 40 },
    propsSchema: {
      height: { type: "number", label: "Height (px)" },
    },
  },

  divider: {
    label: "Divider",
    description: "Horizontal separator line",
    category: "layout",
    defaultProps: { color: "#e3e8ee", margin: 24 },
    propsSchema: {
      color: { type: "color", label: "Color" },
      margin: { type: "number", label: "Vertical margin (px)" },
    },
  },

  section: {
    label: "Section",
    description: "Full-width container for grouping blocks",
    category: "layout",
    container: true,
    defaultProps: { backgroundColor: "", padding: "48px 24px", maxWidth: "1080px" },
    propsSchema: {
      backgroundColor: { type: "color", label: "Background" },
      padding: { type: "string", label: "Padding", helper: "CSS value" },
      maxWidth: { type: "string", label: "Max width" },
    },
  },

  grid: {
    label: "Grid",
    description: "Multi-column layout",
    category: "layout",
    container: true,
    defaultProps: { columns: 2, gap: "24px" },
    propsSchema: {
      columns: {
        type: "select",
        label: "Columns",
        options: [1, 2, 3, 4].map((n) => ({ value: n, label: `${n}` })),
      },
      gap: { type: "string", label: "Gap", helper: "CSS value" },
    },
  },

  embed: {
    label: "Embed",
    description: "YouTube / Vimeo video",
    category: "media",
    defaultProps: { embedUrl: "", aspectRatio: "16/9" },
    propsSchema: {
      embedUrl: { type: "url", label: "Embed URL", helper: "e.g. https://www.youtube.com/embed/…" },
      aspectRatio: {
        type: "select",
        label: "Aspect ratio",
        options: [
          { value: "16/9", label: "16:9" },
          { value: "4/3", label: "4:3" },
          { value: "1/1", label: "1:1" },
        ],
      },
    },
  },

  html: {
    label: "HTML",
    description: "Raw HTML snippet",
    category: "advanced",
    defaultProps: { html: "<div>Custom HTML</div>", sanitized: true },
    propsSchema: {
      html: { type: "text", label: "HTML" },
    },
  },
};

export const blockCategories: Array<{ key: BlockDefinition["category"]; label: string }> = [
  { key: "text", label: "Text" },
  { key: "media", label: "Media" },
  { key: "layout", label: "Layout" },
  { key: "advanced", label: "Advanced" },
];

export function createBlock(type: string): ContentBlock {
  const def = blockRegistry[type];
  return {
    id: newBlockId(),
    type,
    props: structuredClone(def?.defaultProps ?? {}),
    ...(def?.container ? { children: [] } : {}),
  };
}
