"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/toast-context";
import { Pencil, X, Save, ChevronDown, ChevronUp } from "lucide-react";

interface EmailTemplate {
  id: string;
  key: string;
  label: string;
  subject: string;
  htmlBody: string;
  isEnabled: boolean;
  updatedAt: string | null;
}

const VARIABLE_HINTS: Record<string, string[]> = {
  contact_received:  ["{{name}}", "{{email}}", "{{phone}}", "{{message}}"],
  testimonial_added: ["{{name}}", "{{designation}}", "{{rating}}", "{{message}}"],
  page_published:    ["{{title}}", "{{slug}}", "{{publishedBy}}"],
  booking_received:  ["{{name}}", "{{email}}", "{{phone}}", "{{service}}", "{{date}}"],
};

export default function EmailTemplatesPage() {
  const toast = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[] | null>(null);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  async function load() {
    try {
      setTemplates(await api.get<EmailTemplate[]>("/api/email/templates"));
    } catch (err) {
      toast.error("Failed to load templates", err instanceof ApiError ? err.message : undefined);
      setTemplates([]);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleEnabled(t: EmailTemplate) {
    setToggling(t.id);
    try {
      const updated = await api.patch<EmailTemplate>(`/api/email/templates/${t.id}/toggle`, {});
      setTemplates((prev) => prev?.map((x) => x.id === t.id ? updated : x) ?? null);
      toast.success(updated.isEnabled ? `${t.label} enabled` : `${t.label} disabled`);
    } catch (err) {
      toast.error("Failed to toggle", err instanceof ApiError ? err.message : undefined);
    } finally {
      setToggling(null);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await api.put<EmailTemplate>(`/api/email/templates/${editing.id}`, {
        subject: editing.subject,
        htmlBody: editing.htmlBody,
        isEnabled: editing.isEnabled,
      });
      setTemplates((prev) => prev?.map((x) => x.id === editing.id ? updated : x) ?? null);
      setEditing(null);
      toast.success("Template saved");
    } catch (err) {
      toast.error("Failed to save", err instanceof ApiError ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-heading">Email Templates</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage notification emails sent automatically on system events. Use{" "}
          <code className="rounded bg-section px-1 py-0.5 font-mono text-xs text-primary">{"{{variable}}"}</code>{" "}
          placeholders — they are replaced with real values when sent.
        </p>
      </div>

      {/* Edit panel */}
      {editing && (
        <Card>
          <CardHeader
            title={`Edit: ${editing.label}`}
            description={`Key: ${editing.key}`}
            action={
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>
                  <X size={14} /> Cancel
                </Button>
                <Button size="sm" onClick={saveEdit} disabled={saving}>
                  <Save size={14} /> {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            }
          />
          <div className="flex flex-col gap-5 px-6 py-5">
            {/* Variables hint */}
            {VARIABLE_HINTS[editing.key] && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs font-medium text-text-muted">Available variables:</span>
                {VARIABLE_HINTS[editing.key].map((v) => (
                  <code
                    key={v}
                    onClick={() => navigator.clipboard.writeText(v)}
                    title="Click to copy"
                    className="cursor-pointer rounded bg-primary-light px-1.5 py-0.5 font-mono text-xs text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    {v}
                  </code>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text">Subject</label>
              <input
                type="text"
                value={editing.subject}
                onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                className="h-9 w-full rounded-md border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text">HTML Body</label>
                <button
                  type="button"
                  onClick={() => setPreview((v) => !v)}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {preview ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {preview ? "Hide preview" : "Show preview"}
                </button>
              </div>
              <textarea
                rows={12}
                value={editing.htmlBody}
                onChange={(e) => setEditing({ ...editing, htmlBody: e.target.value })}
                className="w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-xs text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)] resize-y"
              />
              {preview && (
                <div
                  className="mt-2 rounded-md border border-border bg-white p-4 text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: editing.htmlBody }}
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <Toggle
                checked={editing.isEnabled}
                onChange={(v) => setEditing({ ...editing, isEnabled: v })}
                label="Enable this template"
              />
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Notification Templates"
          description="Toggle or edit each email template below"
        />
        {templates === null && <SkeletonTable rows={4} cols={4} />}
        {templates?.length === 0 && <EmptyState label="No templates found." />}
        {templates && templates.length > 0 && (
          <Table>
            <TableHead columns={["Event", "Subject", "Enabled", ""]} />
            <tbody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-text">{t.label}</p>
                      <p className="text-xs font-mono text-text-helper">{t.key}</p>
                    </div>
                  </TableCell>
                  <TableCell muted>{t.subject}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Toggle
                        checked={t.isEnabled}
                        onChange={() => toggleEnabled(t)}
                        disabled={toggling === t.id}
                        label=""
                      />
                      <Badge tone={t.isEnabled ? "success" : "neutral"}>
                        {t.isEnabled ? "On" : "Off"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setEditing(t); setPreview(false); }}
                      disabled={editing?.id === t.id}
                    >
                      <Pencil size={13} strokeWidth={1.75} />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <div className="rounded-[10px] border border-border bg-section/60 px-5 py-4 text-sm text-text-muted">
        <strong className="text-text">SMTP setup required.</strong> Emails are sent only when you configure{" "}
        <code className="font-mono text-primary">Smtp:Host</code>,{" "}
        <code className="font-mono text-primary">Smtp:Username</code>, and{" "}
        <code className="font-mono text-primary">Smtp:Password</code> in{" "}
        <code className="font-mono text-primary">appsettings.json</code>{" "}
        (or environment variables). Set <code className="font-mono text-primary">Smtp:AdminEmail</code> as the recipient for admin notifications.
      </div>
    </div>
  );
}
