"use client";

import { useEffect, useRef, useState } from "react";
import { ContentBlock } from "@/lib/page-types";
import { blockRegistry, createBlock } from "@/lib/blocks/registry";
import { BlockContent, blockLabel } from "@/components/blocks/BlockRenderer";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { GripVertical, Plus, ChevronUp, ChevronDown, X } from "lucide-react";

interface CanvasCallbacks {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string, type: string) => void;
  onMoveChild: (parentId: string, childId: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
}

function ChildAddMenu({ parentId, onAddChild }: { parentId: string; onAddChild: CanvasCallbacks["onAddChild"] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex items-center gap-1 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs font-semibold text-text-helper transition-colors hover:border-primary hover:text-primary cursor-pointer"
      >
        <Plus size={13} strokeWidth={2} />
        Add block
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-44 rounded-md border border-border bg-white p-1 shadow-[var(--shadow-card-hover)]">
          {Object.entries(blockRegistry)
            .filter(([, def]) => !def.container)
            .map(([type, def]) => (
              <button
                key={type}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild(parentId, type);
                  setOpen(false);
                }}
                className="block w-full rounded px-2.5 py-1.5 text-left text-[13px] text-text-muted hover:bg-section hover:text-text cursor-pointer"
              >
                {def.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function ChildBlock({
  block,
  parentId,
  cb,
}: {
  block: ContentBlock;
  parentId: string;
  cb: CanvasCallbacks;
}) {
  const selected = cb.selectedId === block.id;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        cb.onSelect(block.id);
      }}
      className={clsx(
        "group/child relative rounded-md border p-3 transition-colors cursor-pointer",
        selected ? "border-primary bg-primary-light/40" : "border-transparent hover:border-border"
      )}
    >
      <div
        className={clsx(
          "absolute -top-2.5 right-2 z-10 hidden items-center gap-0.5 rounded border border-border bg-white px-1 py-0.5 shadow-sm",
          "group-hover/child:flex",
          selected && "flex"
        )}
      >
        <span className="px-1 text-[10px] font-semibold uppercase tracking-wide text-text-helper">
          {blockLabel(block.type)}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            cb.onMoveChild(parentId, block.id, -1);
          }}
          className="rounded p-0.5 text-text-helper hover:text-text cursor-pointer"
        >
          <ChevronUp size={12} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            cb.onMoveChild(parentId, block.id, 1);
          }}
          className="rounded p-0.5 text-text-helper hover:text-text cursor-pointer"
        >
          <ChevronDown size={12} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            cb.onRemove(block.id);
          }}
          className="rounded p-0.5 text-text-helper hover:text-status-danger-text cursor-pointer"
        >
          <X size={12} />
        </button>
      </div>
      <BlockContent block={block}>
        {block.children && (
          <ContainerChildren block={block} cb={cb} />
        )}
      </BlockContent>
    </div>
  );
}

function ContainerChildren({ block, cb }: { block: ContentBlock; cb: CanvasCallbacks }) {
  return (
    <>
      {(block.children ?? []).map((child) => (
        <ChildBlock key={child.id} block={child} parentId={block.id} cb={cb} />
      ))}
      <ChildAddMenu parentId={block.id} onAddChild={cb.onAddChild} />
    </>
  );
}

function SortableBlock({ block, cb }: { block: ContentBlock; cb: CanvasCallbacks }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { source: "canvas" },
  });
  const selected = cb.selectedId === block.id;
  const isContainer = Boolean(blockRegistry[block.type]?.container);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={(e) => {
        e.stopPropagation();
        cb.onSelect(block.id);
      }}
      className={clsx(
        "group relative rounded-lg border bg-white transition-shadow cursor-pointer",
        selected
          ? "border-primary shadow-[var(--shadow-focus)]"
          : "border-transparent hover:border-border hover:shadow-[var(--shadow-card)]",
        isDragging && "z-20 opacity-60 shadow-[var(--shadow-card-hover)]"
      )}
    >
      <div
        className={clsx(
          "absolute -left-0.5 top-1/2 z-10 -translate-x-full -translate-y-1/2 rounded-md border border-border bg-white p-1 text-text-helper shadow-sm transition-opacity cursor-grab active:cursor-grabbing",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} strokeWidth={1.75} />
      </div>

      <div
        className={clsx(
          "absolute -top-2.5 left-3 z-10 rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-helper transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        {blockLabel(block.type)}
      </div>

      <div className="px-4 py-3">
        <BlockContent block={block}>
          {isContainer && <ContainerChildren block={block} cb={cb} />}
        </BlockContent>
      </div>
    </div>
  );
}

export function EditorCanvas({
  blocks,
  cb,
}: {
  blocks: ContentBlock[];
  cb: CanvasCallbacks;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-root" });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "min-h-[480px] rounded-lg border-2 border-dashed p-5 transition-colors",
        isOver ? "border-primary bg-primary-light/30" : "border-transparent"
      )}
    >
      {blocks.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-semibold text-text-muted">Your page is empty</p>
          <p className="text-[13px] text-text-helper">
            Drag a block from the left panel, or click one to add it.
          </p>
        </div>
      ) : (
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {blocks.map((block) => (
              <SortableBlock key={block.id} block={block} cb={cb} />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

export { createBlock };
