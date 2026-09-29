"use client";

import { blockRegistry, blockCategories } from "@/lib/blocks/registry";
import { useDraggable } from "@dnd-kit/core";
import {
  Heading1,
  Pilcrow,
  Image as ImageIcon,
  MousePointerClick,
  Quote,
  MoveVertical,
  Minus,
  Square,
  LayoutGrid,
  MonitorPlay,
  Code2,
  GripVertical,
} from "lucide-react";

const blockIcons: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  heading: Heading1,
  paragraph: Pilcrow,
  image: ImageIcon,
  button: MousePointerClick,
  quote: Quote,
  spacer: MoveVertical,
  divider: Minus,
  section: Square,
  grid: LayoutGrid,
  embed: MonitorPlay,
  html: Code2,
};

function PaletteItem({ type, onAdd }: { type: string; onAdd: (type: string) => void }) {
  const def = blockRegistry[type];
  const Icon = blockIcons[type] ?? Square;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { source: "palette", blockType: type },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      onClick={() => onAdd(type)}
      title={def.description}
      className={`group flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left text-[13px] font-medium text-text-muted transition-colors hover:border-border hover:bg-surface hover:text-text hover:shadow-[var(--shadow-card)] cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <Icon size={15} strokeWidth={1.75} />
      <span className="flex-1">{def.label}</span>
      <GripVertical
        size={13}
        strokeWidth={1.75}
        className="text-transparent transition-colors group-hover:text-text-helper"
      />
    </button>
  );
}

export function BlockPalette({ onAdd }: { onAdd: (type: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      {blockCategories.map((cat) => {
        const types = Object.entries(blockRegistry)
          .filter(([, def]) => def.category === cat.key)
          .map(([type]) => type);
        if (types.length === 0) return null;
        return (
          <div key={cat.key}>
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-helper">
              {cat.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {types.map((type) => (
                <PaletteItem key={type} type={type} onAdd={onAdd} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
