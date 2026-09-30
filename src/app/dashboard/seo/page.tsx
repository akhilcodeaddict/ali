"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { SeoMetaDto, ProductDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { useToast } from "@/lib/toast-context";
import { Sparkles, X } from "lucide-react";

const STATIC_PAGES: { key: string; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "services", label: "All Services" },
  { key: "booking", label: "Booking Page" },
  { key: "contact", label: "Contact" },
  { key: "reviews", label: "Reviews" },
  { key: "gallery", label: "Gallery" },
];

type Catalog = { key: string; label: string }[];

const emptyForm = { label: "", metaTitle: "", metaDescription: "", metaKeywords: "", ogImageUrl: "" };

export default function SeoPage() {
  const toast = useToast();
  const [tab, setTab] = useState<"static" | "services">("static");
  const [overrides, setOverrides] = useState<SeoMetaDto[] | null>(null);
  const [services, setServices] = useState<ProductDto[] | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const siteNameRef = useRef<string | null>(null);

  async function load() {
    try {
      const [ov, svc, settings] = await Promise.all([
        api.get<SeoMetaDto[]>("/api/seo"),
        api.get<ProductDto[]>("/api/products/all"),
        api.get<{ siteName?: string }>("/api/settings").catch(() => null),
      ]);
      setOverrides(ov);
      setServices(svc);
      if (settings?.siteName) siteNameRef.current = settings.siteName;
    } catch (err) {
      toast.error("Failed to load SEO data", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => { load(); }, []);

  async function generateWithAI() {
    if (!editingKey) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageLabel: form.label,
          pageKey: editingKey,
          siteName: siteNameRef.current ?? undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as { metaTitle?: string; metaDescription?: string; metaKeywords?: string };
      setForm((f) => ({
        ...f,
        metaTitle: data.metaTitle ?? f.metaTitle,
        metaDescription: data.metaDescription ?? f.metaDescription,
        metaKeywords: data.metaKeywords ?? f.metaKeywords,
      }));
      toast.success("AI-generated SEO content ready — review and save");
    } catch (err) {
      toast.error("AI generation failed", err instanceof Error ? err.message : undefined);
    } finally {
      setGenerating(false);
    }
  }

  const overrideMap = useMemo(() => {
    const map = new Map<string, SeoMetaDto>();
    overrides?.forEach((o) => map.set(o.pageKey, o));
    return map;
  }, [overrides]);

  const catalog: Catalog = useMemo(() => {
    if (tab === "static") return STATIC_PAGES;
    return (services ?? []).map((s) => ({ key: `service:${s.slug}`, label: s.name }));
  }, [tab, services]);

  const loadingCatalog = tab === "services" ? services === null : false;

  function startEdit(key: string, label: string) {
    const existing = overrideMap.get(key);
    setEditingKey(key);
    setForm({
      label,
      metaTitle: existing?.metaTitle ?? "",
      metaDescription: existing?.metaDescription ?? "",
      metaKeywords: existing?.metaKeywords ?? "",
      ogImageUrl: existing?.ogImageUrl ?? "",
    });
  }

  function cancelEdit() {
    setEditingKey(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingKey) return;
    setSaving(true);
    try {
      await api.put(`/api/seo/${encodeURIComponent(editingKey)}`, {
        label: form.label,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        metaKeywords: form.metaKeywords || null,
        ogImageUrl: form.ogImageUrl || null,
      });
      toast.success("SEO metadata saved");
      cancelEdit();
      load();
    } catch (err) {
      toast.error("Failed to save SEO metadata", err instanceof ApiError ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  async function handleClear(key: string) {
    if (!window.confirm("Remove this override? The page will revert to its default metadata.")) return;
    try {
      await api.delete(`/api/seo/${encodeURIComponent(key)}`);
      toast.success("Override removed");
      if (editingKey === key) cancelEdit();
      load();
    } catch (err) {
      toast.error("Failed to remove override", err instanceof ApiError ? err.message : undefined);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-heading">SEO</h1>
        <p className="mt-1 text-sm text-text-muted">
          Per-page meta title, description, keywords and social preview image for the public site.
        </p>
      </div>

      {editingKey && (
        <Card>
          <CardHeader
            title={`Edit SEO — ${form.label}`}
            action={
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X size={14} strokeWidth={1.75} /> Cancel
              </Button>
            }
          />
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Meta title">
                <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
              </Field>
              <Field label="Meta description">
                <Textarea rows={3} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
              </Field>
              <Field label="Meta keywords" helper="Comma-separated">
                <Input value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })} placeholder="makeup, salon, bridal" />
              </Field>
              <Field label="Social preview image (OG image)">
                <ImageUrlField value={form.ogImageUrl} onChange={(url) => setForm({ ...form, ogImageUrl: url })} />
              </Field>
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={generating || saving}
                  onClick={generateWithAI}
                  className="flex items-center gap-1.5"
                >
                  <Sparkles size={14} strokeWidth={1.75} />
                  {generating ? "Generating…" : "Generate with AI"}
                </Button>
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={saving || generating}>
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  {overrideMap.has(editingKey) && (
                    <Button type="button" variant="danger" onClick={() => handleClear(editingKey)}>
                      Remove override
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Pages"
          action={
            <div className="flex items-center gap-1">
              {([
                { value: "static", label: "Static Pages" },
                { value: "services", label: "Services" },
              ] as const).map((o) => (
                <button
                  key={o.value}
                  onClick={() => setTab(o.value)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    tab === o.value ? "bg-primary text-white" : "text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          }
        />
        {tab === "static" && (
          <div className="border-t border-border px-5 py-3 text-xs text-text-helper">
            &quot;Contact&quot; is a section on the Home page and &quot;Gallery&quot; categories are filter tabs on one page —
            overrides saved here won&apos;t produce unique metadata for those until they get dedicated routes.
          </div>
        )}
        {loadingCatalog && <SkeletonTable rows={4} cols={3} />}
        {!loadingCatalog && catalog.length === 0 && <EmptyState label="Nothing here yet." />}
        {!loadingCatalog && catalog.length > 0 && (
          <Table>
            <TableHead columns={["Page", "Status", ""]} />
            <tbody>
              {catalog.map((c) => {
                const existing = overrideMap.get(c.key);
                return (
                  <TableRow key={c.key}>
                    <TableCell>
                      <span className="font-semibold text-text">{c.label}</span>
                      <span className="block text-xs text-text-helper">{c.key}</span>
                    </TableCell>
                    <TableCell>
                      <Badge tone={existing ? "success" : "neutral"}>
                        {existing ? "Customized" : "Default"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => startEdit(c.key, c.label)}>
                          Edit SEO
                        </Button>
                        {existing && (
                          <Button variant="danger" size="sm" onClick={() => handleClear(c.key)}>
                            <X size={14} strokeWidth={1.75} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
