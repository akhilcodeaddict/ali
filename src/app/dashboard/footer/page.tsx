"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/toast-context";
import { Pencil, Trash2, X, Plus } from "lucide-react";

export interface FooterSectionDto {
  id: string;
  title: string;
  order: number;
  isActive: boolean;
  links: FooterLinkDto[];
}

export interface FooterLinkDto {
  id: string;
  sectionId: string;
  label: string;
  url: string;
  order: number;
  openInNewTab: boolean;
  isActive: boolean;
}

const emptySection = { title: "", order: 0, isActive: true };
const emptyLink = { sectionId: "", label: "", url: "", order: 0, openInNewTab: false, isActive: true };

export default function FooterPage() {
  const toast = useToast();
  const [sections, setSections] = useState<FooterSectionDto[] | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState(emptySection);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState(emptyLink);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState(false);
  const [savingLink, setSavingLink] = useState(false);

  async function load() {
    try {
      setSections(null);
      setSections(await api.get<FooterSectionDto[]>("/api/footer/sections"));
    } catch (err) {
      toast.error("Failed to load footer", err instanceof ApiError ? err.message : undefined);
      setSections([]);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (sections && sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections]);

  const activeSection = sections?.find((s) => s.id === activeSectionId) ?? null;

  async function handleSectionSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingSection(true);
    try {
      if (editingSectionId) await api.put(`/api/footer/sections/${editingSectionId}`, sectionForm);
      else await api.post("/api/footer/sections", sectionForm);
      toast.success(editingSectionId ? "Section updated" : "Section added");
      setEditingSectionId(null);
      setSectionForm(emptySection);
      load();
    } catch (err) {
      toast.error("Failed to save section", err instanceof ApiError ? err.message : undefined);
    } finally {
      setSavingSection(false);
    }
  }

  async function handleDeleteSection(id: string, title: string) {
    if (!window.confirm(`Delete section "${title}" and all its links?`)) return;
    try {
      await api.delete(`/api/footer/sections/${id}`);
      toast.success("Section deleted");
      if (activeSectionId === id) setActiveSectionId(null);
      load();
    } catch (err) {
      toast.error("Failed to delete", err instanceof ApiError ? err.message : undefined);
    }
  }

  async function handleLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeSectionId) return;
    setSavingLink(true);
    try {
      const payload = { ...linkForm, sectionId: activeSectionId };
      if (editingLinkId) await api.put(`/api/footer/links/${editingLinkId}`, payload);
      else await api.post("/api/footer/links", payload);
      toast.success(editingLinkId ? "Link updated" : "Link added");
      setEditingLinkId(null);
      setLinkForm(emptyLink);
      load();
    } catch (err) {
      toast.error("Failed to save link", err instanceof ApiError ? err.message : undefined);
    } finally {
      setSavingLink(false);
    }
  }

  async function handleDeleteLink(id: string, label: string) {
    if (!window.confirm(`Delete link "${label}"?`)) return;
    try {
      await api.delete(`/api/footer/links/${id}`);
      toast.success("Link deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete", err instanceof ApiError ? err.message : undefined);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-heading">Footer Manager</h1>
        <p className="mt-1 text-sm text-text-muted">Manage footer sections and links shown on the frontend.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sections panel */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader
              title={editingSectionId ? "Edit section" : "Add section"}
              action={editingSectionId ? (
                <Button variant="ghost" size="sm" onClick={() => { setEditingSectionId(null); setSectionForm(emptySection); }}>
                  <X size={14} strokeWidth={1.75} /> Cancel
                </Button>
              ) : undefined}
            />
            <CardBody>
              <form onSubmit={handleSectionSubmit} className="flex flex-col gap-3">
                <Field label="Section title">
                  <Input value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} required placeholder="e.g. Company" />
                </Field>
                <Field label="Order">
                  <Input type="number" value={sectionForm.order} onChange={(e) => setSectionForm({ ...sectionForm, order: Number(e.target.value) })} />
                </Field>
                <Toggle checked={sectionForm.isActive} onChange={(v) => setSectionForm({ ...sectionForm, isActive: v })} label="Active" />
                <Button type="submit" disabled={savingSection} size="sm">
                  <Plus size={14} />
                  {savingSection ? "Saving…" : editingSectionId ? "Save" : "Add section"}
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Sections" />
            {sections === null && <div className="animate-pulse p-4 flex flex-col gap-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-9 rounded bg-border/70" />)}</div>}
            {sections?.length === 0 && <EmptyState label="No sections yet." />}
            {sections && sections.length > 0 && (
              <div className="flex flex-col divide-y divide-border">
                {sections.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-section transition-colors ${activeSectionId === s.id ? "bg-primary-light" : ""}`}
                    onClick={() => setActiveSectionId(s.id)}
                  >
                    <span className={`text-sm font-medium ${activeSectionId === s.id ? "text-primary" : "text-text"}`}>{s.title}</span>
                    <div className="flex items-center gap-1">
                      <Badge tone={s.isActive ? "success" : "neutral"} className="text-[10px]">{s.links.length}</Badge>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingSectionId(s.id); setSectionForm({ title: s.title, order: s.order, isActive: s.isActive }); }}>
                        <Pencil size={12} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteSection(s.id, s.title); }}>
                        <Trash2 size={12} className="text-status-danger-text" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Links panel */}
        <div className="flex flex-col gap-4">
          {activeSection ? (
            <>
              <Card>
                <CardHeader
                  title={editingLinkId ? "Edit link" : `Add link to "${activeSection.title}"`}
                  action={editingLinkId ? (
                    <Button variant="ghost" size="sm" onClick={() => { setEditingLinkId(null); setLinkForm(emptyLink); }}>
                      <X size={14} strokeWidth={1.75} /> Cancel
                    </Button>
                  ) : undefined}
                />
                <CardBody>
                  <form onSubmit={handleLinkSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Label">
                        <Input value={linkForm.label} onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })} required placeholder="e.g. Privacy Policy" />
                      </Field>
                      <Field label="URL">
                        <Input value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} required placeholder="/privacy or https://…" />
                      </Field>
                      <Field label="Order">
                        <Input type="number" value={linkForm.order} onChange={(e) => setLinkForm({ ...linkForm, order: Number(e.target.value) })} />
                      </Field>
                    </div>
                    <div className="flex items-center gap-6">
                      <Toggle checked={linkForm.openInNewTab} onChange={(v) => setLinkForm({ ...linkForm, openInNewTab: v })} label="Open in new tab" />
                      <Toggle checked={linkForm.isActive} onChange={(v) => setLinkForm({ ...linkForm, isActive: v })} label="Active" />
                    </div>
                    <div>
                      <Button type="submit" disabled={savingLink}>
                        {savingLink ? "Saving…" : editingLinkId ? "Save changes" : "Add link"}
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title={`Links in "${activeSection.title}"`} description={`${activeSection.links.length} link(s)`} />
                {activeSection.links.length === 0 && <EmptyState label="No links in this section yet." />}
                {activeSection.links.length > 0 && (
                  <Table>
                    <TableHead columns={["Label", "URL", "Status", ""]} />
                    <tbody>
                      {activeSection.links.map((link) => (
                        <TableRow key={link.id}>
                          <TableCell>
                            <span className="font-medium text-text">{link.label}</span>
                          </TableCell>
                          <TableCell muted>
                            <span className="truncate block max-w-[220px]">{link.url}</span>
                          </TableCell>
                          <TableCell>
                            <Badge tone={link.isActive ? "success" : "neutral"}>{link.isActive ? "Active" : "Hidden"}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="secondary" size="sm" onClick={() => { setEditingLinkId(link.id); setLinkForm({ sectionId: link.sectionId, label: link.label, url: link.url, order: link.order, openInNewTab: link.openInNewTab, isActive: link.isActive }); }}>
                                <Pencil size={14} strokeWidth={1.75} />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleDeleteLink(link.id, link.label)}>
                                <Trash2 size={14} strokeWidth={1.75} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-[12px] border border-dashed border-border text-sm text-text-muted">
              Select a section on the left to manage its links
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
