"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { api, ApiError } from "@/lib/api";
import {
  ContentBlock,
  PageDetail,
  PageVersionItem,
  PublishResult,
  UpsertPagePayload,
} from "@/lib/page-types";
import { createBlock } from "@/lib/blocks/registry";
import { findBlock, updateBlockProps, removeBlock, appendChild, moveChild } from "@/lib/blocks/tree";
import { BlockPalette } from "@/components/editor/BlockPalette";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { PageSettingsDrawer, PageSettings } from "@/components/editor/PageSettingsDrawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/lib/toast-context";
import { useConfirm } from "@/lib/confirm-context";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings2,
  Undo2,
  Redo2,
  History,
  CloudUpload,
  Globe,
  CircleSlash,
} from "lucide-react";

const statusTone = {
  Draft: "neutral",
  Review: "warning",
  Scheduled: "warning",
  Published: "success",
  Archived: "neutral",
} as const;

export default function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [page, setPage] = useState<PageDetail | null>(null);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [settings, setSettings] = useState<PageSettings | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<PageVersionItem[]>([]);
  const router = useRouter();
  const toast = useToast();
  const ask = useConfirm();
  const setNotice = (m: string) => toast.success(m);
  const [saving, setSaving] = useState(false);
  const [lastAutosave, setLastAutosave] = useState<Date | null>(null);

  // Undo/redo history
  const historyRef = useRef<ContentBlock[][]>([]);
  const historyIndexRef = useRef(-1);
  const dirtyRef = useRef(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const pushHistory = useCallback((next: ContentBlock[]) => {
    const stack = historyRef.current.slice(0, historyIndexRef.current + 1);
    stack.push(next);
    if (stack.length > 50) stack.shift();
    historyRef.current = stack;
    historyIndexRef.current = stack.length - 1;
  }, []);

  const applyBlocks = useCallback(
    (next: ContentBlock[]) => {
      setBlocks(next);
      pushHistory(next);
      dirtyRef.current = true;
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      setBlocks(historyRef.current[historyIndexRef.current]);
      dirtyRef.current = true;
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      setBlocks(historyRef.current[historyIndexRef.current]);
      dirtyRef.current = true;
    }
  }, []);

  // Load page
  useEffect(() => {
    api
      .get<PageDetail>(`/api/pages/by-id/${id}`)
      .then((p) => {
        setPage(p);
        setTitle(p.title);
        const initialBlocks = p.content?.blocks ?? [];
        setBlocks(initialBlocks);
        historyRef.current = [initialBlocks];
        historyIndexRef.current = 0;
        setSettings({
          slug: p.slug,
          subtitle: p.subtitle ?? "",
          description: p.description ?? "",
          seo: p.seo,
          hero: p.hero,
          showInMenu: p.showInMenu,
          menuLabel: p.menuLabel ?? "",
          displayOrder: p.displayOrder,
          featuredImageUrl: p.featuredImageUrl ?? "",
          featuredImageAlt: p.featuredImageAlt ?? "",
        });
      })
      .catch((err) => {
        // Nothing to edit without the page: say why and go back to the list.
        toast.error("Could not open page", err instanceof ApiError ? err.message : undefined);
        router.replace("/dashboard/pages");
      });
  }, [id]);

  // Autosave draft every 30 seconds. State is read through refs so the
  // interval survives edits (deps would reset the timer on every keystroke).
  const latestRef = useRef({ title: "", blocks: [] as ContentBlock[] });
  latestRef.current = { title, blocks };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!dirtyRef.current) return;
      try {
        await api.post(`/api/pages/${id}/draft`, {
          title: latestRef.current.title,
          content: { version: "1.0", blocks: latestRef.current.blocks },
        });
        dirtyRef.current = false;
        setLastAutosave(new Date());
      } catch {
        /* autosave is best-effort */
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [id]);

  function buildPayload(): UpsertPagePayload {
    return {
      title,
      slug: settings!.slug,
      subtitle: settings!.subtitle || null,
      description: settings!.description || null,
      content: { version: "1.0", blocks },
      featuredImageUrl: settings!.featuredImageUrl || null,
      featuredImageAlt: settings!.featuredImageAlt || null,
      hero: settings!.hero,
      seo: settings!.seo,
      showInMenu: settings!.showInMenu,
      menuLabel: settings!.menuLabel || null,
      displayOrder: settings!.displayOrder,
    };
  }

  async function save(): Promise<boolean> {
    setSaving(true);
    try {
      const updated = await api.put<PageDetail>(`/api/pages/${id}`, buildPayload());
      setPage(updated);
      dirtyRef.current = false;
      setNotice("Saved.");
      return true;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!(await save())) return;
    try {
      const result = await api.patch<PublishResult>(`/api/pages/${id}/publish`, {
        scheduledPublishDate: null,
        publishEndDate: null,
      });
      setPage(result.page);
      setNotice(
        result.warnings.length > 0 ? `Published with warnings: ${result.warnings.join(" ")}` : "Published."
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to publish.");
    }
  }

  async function unpublish() {
    try {
      const updated = await api.patch<PageDetail>(`/api/pages/${id}/unpublish`);
      setPage(updated);
      setNotice("Unpublished — page is now a draft.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to unpublish.");
    }
  }

  async function openVersions() {
    setVersions(await api.get<PageVersionItem[]>(`/api/pages/${id}/versions`));
    setVersionsOpen(true);
  }

  async function restoreVersion(versionId: string) {
    if (!await ask("Restore this version? Current state is snapshotted first.")) return;
    const restored = await api.post<PageDetail>(`/api/pages/${id}/versions/${versionId}/restore`);
    setPage(restored);
    setTitle(restored.title);
    const restoredBlocks = restored.content?.blocks ?? [];
    setBlocks(restoredBlocks);
    pushHistory(restoredBlocks);
    setVersionsOpen(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    // Drag from palette → append to canvas
    if (active.data.current?.source === "palette") {
      const type = active.data.current.blockType as string;
      applyBlocks([...blocks, createBlock(type)]);
      return;
    }

    // Reorder within canvas
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        applyBlocks(arrayMove(blocks, oldIndex, newIndex));
      }
    }
  }

  if (!page || !settings) return (
    <div className="fixed inset-y-0 left-[232px] right-0 z-30 flex flex-col bg-section animate-pulse">
      <div className="flex items-center gap-4 border-b border-border bg-surface px-5 py-3">
        <div className="h-8 w-8 rounded-lg bg-border/70" />
        <div className="h-5 w-40 rounded-lg bg-border/70" />
        <div className="ml-auto flex gap-2">
          <div className="h-8 w-20 rounded-lg bg-border/70" />
          <div className="h-8 w-24 rounded-lg bg-border/70" />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 border-r border-border bg-surface p-3 flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-border/70" />
          ))}
        </div>
        <div className="flex-1 p-8 flex flex-col gap-4">
          <div className="h-24 w-full rounded-lg bg-border/70" />
          <div className="h-16 w-full rounded-lg bg-border/70" />
          <div className="h-32 w-full rounded-lg bg-border/70" />
        </div>
        <div className="w-72 border-l border-border bg-surface p-4 flex flex-col gap-3">
          <div className="h-4 w-24 rounded-lg bg-border/70" />
          <div className="h-8 w-full rounded-lg bg-border/70" />
          <div className="h-8 w-full rounded-lg bg-border/70" />
          <div className="h-8 w-full rounded-lg bg-border/70" />
        </div>
      </div>
    </div>
  );

  const selectedBlock = selectedId ? findBlock(blocks, selectedId) : null;

  return (
    <div className="fixed inset-y-0 left-[232px] right-0 z-30 flex flex-col bg-section">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 border-b border-border bg-surface px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard/pages"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-section hover:text-text"
          >
            <ArrowLeft size={16} strokeWidth={1.75} />
          </Link>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              dirtyRef.current = true;
            }}
            className="w-72 font-semibold"
          />
          <Badge tone={statusTone[page.status]}>{page.status}</Badge>
          <span className="hidden text-xs text-text-helper lg:block">
            v{page.currentVersion}
            {lastAutosave && ` · autosaved ${lastAutosave.toLocaleTimeString()}`}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" onClick={undo} title="Undo">
            <Undo2 size={14} strokeWidth={1.75} />
          </Button>
          <Button variant="ghost" size="sm" onClick={redo} title="Redo">
            <Redo2 size={14} strokeWidth={1.75} />
          </Button>
          <Button variant="ghost" size="sm" onClick={openVersions}>
            <History size={14} strokeWidth={1.75} />
            History
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
            <Settings2 size={14} strokeWidth={1.75} />
            Settings
          </Button>
          <Button variant="secondary" size="sm" onClick={save} disabled={saving}>
            <CloudUpload size={14} strokeWidth={1.75} />
            {saving ? "Saving…" : "Save"}
          </Button>
          {page.status === "Published" ? (
            <Button variant="danger" size="sm" onClick={unpublish}>
              <CircleSlash size={14} strokeWidth={1.75} />
              Unpublish
            </Button>
          ) : (
            <Button size="sm" onClick={publish}>
              <Globe size={14} strokeWidth={1.75} />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Three-pane editor */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex min-h-0 flex-1">
          <aside className="w-56 shrink-0 overflow-y-auto border-r border-border bg-surface px-3 py-4">
            <BlockPalette onAdd={(type) => applyBlocks([...blocks, createBlock(type)])} />
          </aside>

          <main
            className="min-w-0 flex-1 overflow-y-auto bg-section px-8 py-6"
            onClick={() => setSelectedId(null)}
          >
            <div className="mx-auto max-w-[820px] pl-6">
              <EditorCanvas
                blocks={blocks}
                cb={{
                  selectedId,
                  onSelect: setSelectedId,
                  onAddChild: (parentId, type) =>
                    applyBlocks(appendChild(blocks, parentId, createBlock(type))),
                  onMoveChild: (parentId, childId, dir) =>
                    applyBlocks(moveChild(blocks, parentId, childId, dir)),
                  onRemove: (blockId) => {
                    applyBlocks(removeBlock(blocks, blockId));
                    if (selectedId === blockId) setSelectedId(null);
                  },
                }}
              />
            </div>
          </main>

          <aside className="w-80 shrink-0 overflow-y-auto border-l border-border bg-surface px-4 py-4">
            {selectedBlock ? (
              <PropertiesPanel
                block={selectedBlock}
                onUpdateProps={(props) => applyBlocks(updateBlockProps(blocks, selectedBlock.id, props))}
                onDelete={() => {
                  applyBlocks(removeBlock(blocks, selectedBlock.id));
                  setSelectedId(null);
                }}
              />
            ) : (
              <div className="flex h-40 items-center justify-center text-center text-[13px] text-text-helper">
                Select a block to edit its properties
              </div>
            )}
          </aside>
        </div>
      </DndContext>

      <PageSettingsDrawer
        open={settingsOpen}
        settings={settings}
        onChange={setSettings}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Version history modal */}
      {versionsOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setVersionsOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface shadow-[var(--shadow-card-hover)]">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-[17px] font-bold text-text">Version history</h2>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-3">
              {versions.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-text-muted">
                  No versions yet — versions are created each time you save.
                </p>
              ) : (
                versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-section"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text">
                        v{v.versionNumber} — {v.title}
                      </p>
                      <p className="text-xs text-text-helper">
                        {new Date(v.createdAt).toLocaleString()}
                        {v.changeReason && ` · ${v.changeReason}`}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => restoreVersion(v.id)}>
                      Restore
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
