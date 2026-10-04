"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { HeroDto, HeroSlideDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { useToast } from "@/lib/toast-context";
import { useConfirm } from "@/lib/confirm-context";
import { Trash2, Plus } from "lucide-react";

const EMPTY_HERO: HeroDto = {
  id: "",
  title: "",
  subtitle: "",
  backgroundImageUrl: null,
  primaryCtaLabel: "",
  primaryCtaUrl: null,
  secondaryCtaLabel: "",
  secondaryCtaUrl: null,
  description: null,
};

export default function HeroPage() {
  const toast = useToast();
  const ask = useConfirm();
  const [hero, setHero] = useState<HeroDto | null>(null);
  const [slides, setSlides] = useState<HeroSlideDto[] | null>(null);
  const [newSlideUrl, setNewSlideUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [h, s] = await Promise.all([
        api.get<HeroDto>("/api/hero").catch(() => null),
        api.get<HeroSlideDto[]>("/api/hero/slides").catch(() => []),
      ]);
      setHero(h ?? EMPTY_HERO);
      setSlides(s ?? []);
    } catch (err) {
      toast.error("Failed to load hero", err instanceof ApiError ? err.message : undefined);
      setHero(EMPTY_HERO);
      setSlides([]);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hero) return;
    setSaving(true);
    try {
      const payload = {
        title: hero.title,
        subtitle: hero.subtitle,
        backgroundImageUrl: hero.backgroundImageUrl || null,
        primaryCtaLabel: hero.primaryCtaLabel,
        primaryCtaUrl: hero.primaryCtaUrl || null,
        secondaryCtaLabel: hero.secondaryCtaLabel,
        secondaryCtaUrl: hero.secondaryCtaUrl || null,
        description: hero.description || null,
      };
      if (hero.id) await api.put("/api/hero", payload);
      else await api.post("/api/hero", payload);
      toast.success("Banner saved");
      load();
    } catch (err) {
      toast.error("Failed to save banner", err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function addSlide() {
    if (!newSlideUrl.trim()) return;
    try {
      await api.post("/api/hero/slides", { imageUrl: newSlideUrl.trim(), sortOrder: slides?.length ?? 0 });
      setNewSlideUrl("");
      toast.success("Slide added");
      load();
    } catch (err) {
      toast.error("Failed to add slide", err instanceof ApiError ? err.message : undefined);
    }
  }

  async function toggleSlide(id: string) {
    await api.put(`/api/hero/slides/${id}/toggle`);
    load();
  }

  async function deleteSlide(id: string) {
    if (!await ask("Remove this slide?")) return;
    try {
      await api.delete(`/api/hero/slides/${id}`);
      toast.success("Slide removed");
      load();
    } catch (err) {
      toast.error("Failed to remove slide", err instanceof ApiError ? err.message : undefined);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-text">Hero</h1>
        <p className="mt-1 text-sm text-text-muted">Homepage banner text, CTAs, and slideshow.</p>
      </div>

      <Card>
        <CardHeader title="Banner" />
        <CardBody>
          {hero ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Title">
                  <Input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
                </Field>
                <Field label="Subtitle">
                  <Input value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description" helper="Optional short paragraph shown below the heading on the homepage.">
                    <Textarea
                      rows={3}
                      value={hero.description ?? ""}
                      onChange={(e) => setHero({ ...hero, description: e.target.value })}
                      placeholder="e.g. Crafting timeless wedding stories across India..."
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Background image">
                    <ImageUrlField
                      value={hero.backgroundImageUrl ?? ""}
                      onChange={(url) => setHero({ ...hero, backgroundImageUrl: url })}
                    />
                  </Field>
                </div>
                <Field label="Primary CTA label">
                  <Input value={hero.primaryCtaLabel} onChange={(e) => setHero({ ...hero, primaryCtaLabel: e.target.value })} />
                </Field>
                <Field label="Primary CTA URL">
                  <Input value={hero.primaryCtaUrl ?? ""} onChange={(e) => setHero({ ...hero, primaryCtaUrl: e.target.value })} />
                </Field>
                <Field label="Secondary CTA label">
                  <Input value={hero.secondaryCtaLabel} onChange={(e) => setHero({ ...hero, secondaryCtaLabel: e.target.value })} />
                </Field>
                <Field label="Secondary CTA URL">
                  <Input value={hero.secondaryCtaUrl ?? ""} onChange={(e) => setHero({ ...hero, secondaryCtaUrl: e.target.value })} />
                </Field>
              </div>
              <div>
                <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save banner"}</Button>
              </div>
            </form>
          ) : (
            <div className="animate-pulse flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 rounded-lg bg-border/70" />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Slideshow" description="Background images that rotate on the homepage" />
        <CardBody className="flex flex-col gap-5">
          <div className="flex gap-3">
            <div className="flex-1">
              <ImageUrlField value={newSlideUrl} onChange={setNewSlideUrl} />
            </div>
            <Button onClick={addSlide} type="button">
              <Plus size={16} strokeWidth={2} />
              Add
            </Button>
          </div>

          {slides === null && <SkeletonTable rows={3} cols={3} />}
          {slides && slides.length === 0 && <EmptyState label="No slides yet." />}
          {slides && slides.length > 0 && (
            <Table>
              <TableHead columns={["Image URL", "Active", ""]} />
              <tbody>
                {slides.map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell muted>
                      <span className="block max-w-[400px] truncate">{slide.imageUrl}</span>
                    </TableCell>
                    <TableCell>
                      <Toggle checked={slide.isActive} onChange={() => toggleSlide(slide.id)} />
                    </TableCell>
                    <TableCell>
                      <Button variant="danger" size="sm" onClick={() => deleteSlide(slide.id)}>
                        <Trash2 size={14} strokeWidth={1.75} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
