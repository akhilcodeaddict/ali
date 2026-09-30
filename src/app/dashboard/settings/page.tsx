"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { SiteSettingsDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ImageUrlField } from "@/components/media/MediaPicker";

type Form = Omit<SiteSettingsDto, "id">;

const emptyForm: Form = {
  siteName: "",
  tagline: null,
  logoUrl: null,
  faviconUrl: null,
  contactEmail: null,
  contactPhone: null,
  address: null,
  facebookUrl: null,
  twitterUrl: null,
  instagramUrl: null,
  linkedInUrl: null,
  youtubeUrl: null,
  whatsAppNumber: null,
  googleMapsUrl: null,
  websiteUrl: null,
  metaTitle: null,
  metaDescription: null,
  googleAnalyticsId: null,
  maintenanceMode: false,
  copyrightText: null,
  defaultLanguage: "en",
  timeZone: null,
  requireTestimonialApproval: true,
  smtpHost: null,
  smtpPort: 587,
  smtpUsername: null,
  smtpPassword: null,
  smtpFromName: null,
  smtpAdminEmail: null,
  smtpUseSsl: false,
};

export default function SettingsPage() {
  const [form, setForm] = useState<Form>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<SiteSettingsDto>("/api/settings").then((s) => {
      const { id: _id, ...rest } = s;
      setForm(rest);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await api.put("/api/settings", form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  const str = (v: string | null | undefined) => v ?? "";
  const set = (key: keyof Form, val: string | boolean | null) =>
    setForm((f) => ({ ...f, [key]: val === "" ? null : val }));

  if (loading) return (
    <div className="flex flex-col gap-6">
      <div><div className="h-8 w-48 animate-pulse rounded-lg bg-border/70" /></div>
      <SkeletonCard /><SkeletonCard /><SkeletonCard />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-heading">Site Settings</h1>
          <p className="mt-1 text-sm text-text-muted">Global configuration for your website.</p>
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>

      {error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">{error}</p>}
      {success && <p className="rounded-lg bg-status-success-bg px-3 py-2 text-sm text-status-success-text">Settings saved successfully.</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        <Card>
          <CardHeader title="General" description="Basic site information" />
          <CardBody>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Site name">
                <Input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} required />
              </Field>
              <Field label="Tagline">
                <Input value={str(form.tagline)} onChange={(e) => set("tagline", e.target.value)} placeholder="Your catchy slogan" />
              </Field>
              <Field label="Website URL">
                <Input type="url" value={str(form.websiteUrl)} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="https://example.com" />
              </Field>
              <Field label="Copyright text">
                <Input value={str(form.copyrightText)} onChange={(e) => set("copyrightText", e.target.value)} placeholder="© 2025 Company Name" />
              </Field>
              <Field label="Logo">
                <ImageUrlField value={str(form.logoUrl)} onChange={(url) => set("logoUrl", url)} />
              </Field>
              <Field label="Favicon">
                <ImageUrlField value={str(form.faviconUrl)} onChange={(url) => set("faviconUrl", url)} />
              </Field>
              <Field label="Default language">
                <Input value={str(form.defaultLanguage)} onChange={(e) => set("defaultLanguage", e.target.value)} placeholder="en" />
              </Field>
              <Field label="Time zone">
                <Input value={str(form.timeZone)} onChange={(e) => set("timeZone", e.target.value)} placeholder="Asia/Kolkata" />
              </Field>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <Toggle
                checked={form.maintenanceMode}
                onChange={(v) => set("maintenanceMode", v)}
                label="Maintenance mode"
              />
              <Toggle
                checked={form.requireTestimonialApproval}
                onChange={(v) => set("requireTestimonialApproval", v)}
                label="Require approval before testimonials go live"
              />
              <p className="text-xs text-text-helper">
                {form.requireTestimonialApproval
                  ? "New testimonials land as Pending in the Testimonials page and won't appear on the site until approved."
                  : "New testimonials appear on the site immediately, with no admin review step."}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Contact"
            description="Used in email template placeholders ({{phone}}, {{email}}, {{address}}) — not shown on the public site. To change the phone/email/address customers see in the Contact section, use Contact & Leads → Office details instead."
          />
          <CardBody>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Contact email">
                <Input type="email" value={str(form.contactEmail)} onChange={(e) => set("contactEmail", e.target.value)} />
              </Field>
              <Field label="Contact phone">
                <Input value={str(form.contactPhone)} onChange={(e) => set("contactPhone", e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <Textarea rows={2} value={str(form.address)} onChange={(e) => set("address", e.target.value)} />
                </Field>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Social media" description="Links to your social profiles" />
          <CardBody>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Facebook">
                <Input type="url" value={str(form.facebookUrl)} onChange={(e) => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/…" />
              </Field>
              <Field label="Twitter / X">
                <Input type="url" value={str(form.twitterUrl)} onChange={(e) => set("twitterUrl", e.target.value)} placeholder="https://x.com/…" />
              </Field>
              <Field label="Instagram">
                <Input type="url" value={str(form.instagramUrl)} onChange={(e) => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/…" />
              </Field>
              <Field label="LinkedIn">
                <Input type="url" value={str(form.linkedInUrl)} onChange={(e) => set("linkedInUrl", e.target.value)} placeholder="https://linkedin.com/…" />
              </Field>
              <Field label="YouTube">
                <Input type="url" value={str(form.youtubeUrl)} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/…" />
              </Field>
              <Field label="WhatsApp number" helper="Include country code, e.g. +919876543210">
                <Input value={str(form.whatsAppNumber)} onChange={(e) => set("whatsAppNumber", e.target.value)} placeholder="+919876543210" />
              </Field>
              <Field label="Google Maps (shop link)">
                <Input type="url" value={str(form.googleMapsUrl)} onChange={(e) => set("googleMapsUrl", e.target.value)} placeholder="https://maps.app.goo.gl/…" />
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="SEO & Analytics" description="Default metadata and tracking" />
          <CardBody>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Default meta title">
                <Input value={str(form.metaTitle)} onChange={(e) => set("metaTitle", e.target.value)} />
              </Field>
              <Field label="Google Analytics ID">
                <Input value={str(form.googleAnalyticsId)} onChange={(e) => set("googleAnalyticsId", e.target.value)} placeholder="G-XXXXXXXXXX" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Default meta description">
                  <Textarea rows={2} value={str(form.metaDescription)} onChange={(e) => set("metaDescription", e.target.value)} />
                </Field>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Email / SMTP"
            description="Configure outgoing email delivery. Used for contact notifications, testimonial alerts, and page publish events."
          />
          <CardBody>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="SMTP host">
                <Input
                  value={str(form.smtpHost)}
                  onChange={(e) => set("smtpHost", e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </Field>
              <Field label="Port">
                <Input
                  type="number"
                  value={form.smtpPort ?? 587}
                  onChange={(e) => setForm((f) => ({ ...f, smtpPort: parseInt(e.target.value) || 587 }))}
                  placeholder="587"
                />
              </Field>
              <Field label="Username / Email">
                <Input
                  type="email"
                  value={str(form.smtpUsername)}
                  onChange={(e) => set("smtpUsername", e.target.value)}
                  placeholder="you@gmail.com"
                  autoComplete="off"
                />
              </Field>
              <Field label="App password">
                <Input
                  type="password"
                  value={str(form.smtpPassword)}
                  onChange={(e) => set("smtpPassword", e.target.value)}
                  placeholder="Leave blank to keep existing"
                  autoComplete="new-password"
                />
              </Field>
              <Field label="From name">
                <Input
                  value={str(form.smtpFromName)}
                  onChange={(e) => set("smtpFromName", e.target.value)}
                  placeholder="గణన యంత్రం (Ganana Yantramu)"
                />
              </Field>
              <Field label="Admin notification email">
                <Input
                  type="email"
                  value={str(form.smtpAdminEmail)}
                  onChange={(e) => set("smtpAdminEmail", e.target.value)}
                  placeholder="admin@yourdomain.com"
                />
              </Field>
            </div>
            <div className="mt-4">
              <Toggle
                checked={form.smtpUseSsl ?? false}
                onChange={(v) => setForm((f) => ({ ...f, smtpUseSsl: v }))}
                label="Use SSL (port 465) — leave off for STARTTLS (port 587)"
              />
            </div>
            <p className="mt-3 text-xs text-text-muted">
              For Gmail: enable 2-Step Verification → generate an App Password at{" "}
              <span className="font-medium text-text">myaccount.google.com/apppasswords</span>.
              Use <span className="font-mono">smtp.gmail.com</span>, port <span className="font-mono">587</span>, SSL off.
            </p>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
