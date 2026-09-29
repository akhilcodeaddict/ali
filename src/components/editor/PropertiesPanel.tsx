"use client";

import { ContentBlock } from "@/lib/page-types";
import { blockRegistry, PropField } from "@/lib/blocks/registry";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { Trash2 } from "lucide-react";

function PropInput({
  field,
  value,
  onChange,
}: {
  field: PropField;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
}) {
  switch (field.type) {
    case "image":
      return <ImageUrlField value={value ?? ""} onChange={onChange} />;
    case "boolean":
      return <Toggle checked={Boolean(value)} onChange={onChange} />;
    case "number":
      return (
        <Input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );
    case "select":
      return (
        <select
          value={String(value ?? "")}
          onChange={(e) => {
            const opt = field.options?.find((o) => String(o.value) === e.target.value);
            onChange(opt ? opt.value : e.target.value);
          }}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-primary focus:shadow-[var(--shadow-focus)]"
        >
          {field.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-10 cursor-pointer rounded-lg border border-border bg-surface p-1"
          />
          <Input
            value={value ?? ""}
            placeholder="inherit"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "text":
    case "richtext":
      return (
        <Textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      );
    default:
      return <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
}

export function PropertiesPanel({
  block,
  onUpdateProps,
  onDelete,
}: {
  block: ContentBlock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateProps: (props: Record<string, any>) => void;
  onDelete: () => void;
}) {
  const def = blockRegistry[block.type];
  if (!def) {
    return <p className="text-sm text-text-muted">Unknown block type: {block.type}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-text">{def.label}</h3>
          <p className="text-xs text-text-helper">{def.description}</p>
        </div>
        <Button variant="danger" size="sm" onClick={onDelete} title="Delete block">
          <Trash2 size={14} strokeWidth={1.75} />
        </Button>
      </div>

      {Object.entries(def.propsSchema).map(([key, field]) => (
        <Field key={key} label={field.label} helper={field.helper}>
          <PropInput
            field={field}
            value={block.props[key]}
            onChange={(v) => onUpdateProps({ ...block.props, [key]: v })}
          />
        </Field>
      ))}
    </div>
  );
}
