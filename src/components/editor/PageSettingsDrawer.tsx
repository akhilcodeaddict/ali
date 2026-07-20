"use client";

import { HeroSettings, SeoSettings } from "@/lib/page-types";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { Toggle } from "@/components/ui/Toggle";
import { X } from "lucide-react";

export interface PageSettings {
  slug: string;
  subtitle: string;
  description: string;
  seo: SeoSettings;
  hero: HeroSettings;
  showInMenu: boolean;
  menuLabel: string;
  displayOrder: number;
  featuredImageUrl: string;
  featuredImageAlt: string;
}

export function PageSettingsDrawer({
  open,
  settings,
  onChange,
  onClose,
}: {
  open: boolean;
  settings: PageSettings;
  onChange: (next: PageSettings) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  const set = (patch: Partial<PageSettings>) => onChange({ ...settings, ...patch });
  const setSeo = (patch: Partial<SeoSettings>) => set({ seo: { ...settings.seo, ...patch } });
  const setHero = (patch: Partial<HeroSettings>) => set({ hero: { ...settings.hero, ...patch } });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-[420px] flex-col border-l border-border bg-white shadow-[var(--shadow-card-hover)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[17px] font-bold text-text">Page settings</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-helper hover:bg-section hover:text-text cursor-pointer"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-helper">
                General
              </h3>
              <Field label="Slug" helper="URL path, e.g. about-us">
                <Input value={settings.slug} onChange={(e) => set({ slug: e.target.value })} />
              </Field>
              <Field label="Subtitle">
                <Input value={settings.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
              </Field>
              <Field label="Description">
                <Textarea
                  rows={2}
                  value={settings.description}
                  onChange={(e) => set({ description: e.target.value })}
                />
              </Field>
              <Field label="Featured image">
                <ImageUrlField
                  value={settings.featuredImageUrl}
                  onChange={(url) => set({ featuredImageUrl: url })}
                />
              </Field>
              <Field label="Featured image alt text">
                <Input
                  value={settings.featuredImageAlt}
                  onChange={(e) => set({ featuredImageAlt: e.target.value })}
                />
              </Field>
            </section>

            <section className="flex flex-col gap-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-helper">
                Navigation
              </h3>
              <Toggle
                checked={settings.showInMenu}
                onChange={(v) => set({ showInMenu: v })}
                label="Show in menu"
              />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Menu label" helper="Defaults to title">
                  <Input value={settings.menuLabel} onChange={(e) => set({ menuLabel: e.target.value })} />
                </Field>
                <Field label="Order">
                  <Input
                    type="number"
                    value={settings.displayOrder}
                    onChange={(e) => set({ displayOrder: Number(e.target.value) })}
                  />
                </Field>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-helper">
                SEO
              </h3>
              <Field label="Meta title" helper="Recommended 30–60 characters">
                <Input
                  value={settings.seo.metaTitle ?? ""}
                  onChange={(e) => setSeo({ metaTitle: e.target.value })}
                />
              </Field>
              <Field label="Meta description" helper="Recommended 120–160 characters">
                <Textarea
                  rows={3}
                  value={settings.seo.metaDescription ?? ""}
                  onChange={(e) => setSeo({ metaDescription: e.target.value })}
                />
              </Field>
              <Field label="Meta keywords" helper="Comma-separated">
                <Input
                  value={settings.seo.metaKeywords ?? ""}
                  onChange={(e) => setSeo({ metaKeywords: e.target.value })}
                />
              </Field>
              <Field label="Canonical URL">
                <Input
                  value={settings.seo.canonicalUrl ?? ""}
                  onChange={(e) => setSeo({ canonicalUrl: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Robots index">
                  <select
                    value={settings.seo.robotsIndex}
                    onChange={(e) => setSeo({ robotsIndex: e.target.value })}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="index">index</option>
                    <option value="noindex">noindex</option>
                  </select>
                </Field>
                <Field label="Robots follow">
                  <select
                    value={settings.seo.robotsFollow}
                    onChange={(e) => setSeo({ robotsFollow: e.target.value })}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="follow">follow</option>
                    <option value="nofollow">nofollow</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-helper">
                Social sharing
              </h3>
              <Field label="OG title">
                <Input
                  value={settings.seo.ogTitle ?? ""}
                  onChange={(e) => setSeo({ ogTitle: e.target.value })}
                />
              </Field>
              <Field label="OG description">
                <Textarea
                  rows={2}
                  value={settings.seo.ogDescription ?? ""}
                  onChange={(e) => setSeo({ ogDescription: e.target.value })}
                />
              </Field>
              <Field label="OG image">
                <ImageUrlField
                  value={settings.seo.ogImageUrl ?? ""}
                  onChange={(url) => setSeo({ ogImageUrl: url })}
                />
              </Field>
            </section>

            <section className="flex flex-col gap-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-helper">
                Hero section
              </h3>
              <Toggle
                checked={settings.hero.enabled}
                onChange={(v) => setHero({ enabled: v })}
                label="Enable hero"
              />
              {settings.hero.enabled && (
                <>
                  <Field label="Hero title">
                    <Input
                      value={settings.hero.title ?? ""}
                      onChange={(e) => setHero({ title: e.target.value })}
                    />
                  </Field>
                  <Field label="Hero subtitle">
                    <Textarea
                      rows={2}
                      value={settings.hero.subtitle ?? ""}
                      onChange={(e) => setHero({ subtitle: e.target.value })}
                    />
                  </Field>
                  <Field label="Hero image">
                    <ImageUrlField
                      value={settings.hero.imageUrl ?? ""}
                      onChange={(url) => setHero({ imageUrl: url })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="CTA 1 text">
                      <Input
                        value={settings.hero.cta1Text ?? ""}
                        onChange={(e) => setHero({ cta1Text: e.target.value })}
                      />
                    </Field>
                    <Field label="CTA 1 URL">
                      <Input
                        value={settings.hero.cta1Url ?? ""}
                        onChange={(e) => setHero({ cta1Url: e.target.value })}
                      />
                    </Field>
                    <Field label="CTA 2 text">
                      <Input
                        value={settings.hero.cta2Text ?? ""}
                        onChange={(e) => setHero({ cta2Text: e.target.value })}
                      />
                    </Field>
                    <Field label="CTA 2 URL">
                      <Input
                        value={settings.hero.cta2Url ?? ""}
                        onChange={(e) => setHero({ cta2Url: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="flex items-center gap-6">
                    <Toggle
                      checked={settings.hero.overlay}
                      onChange={(v) => setHero({ overlay: v })}
                      label="Dark overlay"
                    />
                    <Field label="Min height (px)">
                      <Input
                        type="number"
                        className="w-24"
                        value={settings.hero.minHeight}
                        onChange={(e) => setHero({ minHeight: Number(e.target.value) })}
                      />
                    </Field>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </aside>
    </>
  );
}
