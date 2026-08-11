"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { TeamMemberDto, UpsertTeamMemberDto } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { ActiveFilter, ActiveFilterValue, filterByActive } from "@/components/ui/ActiveFilter";
import { useToast } from "@/lib/toast-context";
import { Drawer } from "@/components/ui/Drawer";
import { Plus, Pencil, Trash2 } from "lucide-react";

const emptyForm: UpsertTeamMemberDto = {
  name: "",
  title: "",
  experience: "",
  isSpecial: false,
  order: 0,
  bulletPoints: [],
  photoUrl: "",
  linkedInUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  websiteUrl: "",
  isActive: true,
};

export default function TeamPage() {
  const toast = useToast();
  const [members, setMembers] = useState<TeamMemberDto[] | null>(null);
  const [form, setForm] = useState<UpsertTeamMemberDto>(emptyForm);
  const [bulletsRaw, setBulletsRaw] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<ActiveFilterValue>("active");
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    try {
      setMembers(await api.get<TeamMemberDto[]>("/api/team/members/all"));
    } catch (err) {
      toast.error("Failed to load team", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(member: TeamMemberDto) {
    setEditingId(member.id);
    setForm({
      name: member.name,
      title: member.title,
      experience: member.experience ?? "",
      isSpecial: member.isSpecial,
      order: member.order,
      bulletPoints: member.bulletPoints,
      photoUrl: member.photoUrl ?? "",
      linkedInUrl: member.linkedInUrl ?? "",
      twitterUrl: member.twitterUrl ?? "",
      instagramUrl: member.instagramUrl ?? "",
      facebookUrl: member.facebookUrl ?? "",
      websiteUrl: member.websiteUrl ?? "",
      isActive: member.isActive,
    });
    setBulletsRaw(member.bulletPoints.join("\n"));
    setFormOpen(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setBulletsRaw("");
  }

  function closeDrawer() {
    setFormOpen(false);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const dto: UpsertTeamMemberDto = {
      ...form,
      bulletPoints: bulletsRaw.split("\n").map((s) => s.trim()).filter(Boolean),
      linkedInUrl: form.linkedInUrl || null,
      twitterUrl: form.twitterUrl || null,
      instagramUrl: form.instagramUrl || null,
      facebookUrl: form.facebookUrl || null,
      websiteUrl: form.websiteUrl || null,
    };
    try {
      if (editingId) await api.put(`/api/team/members/${editingId}`, dto);
      else await api.post("/api/team/members", dto);
      toast.success(editingId ? "Member updated" : "Member added");
      setFormOpen(false);
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save", err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deactivate this team member? They will be hidden from the people page but can be reactivated later.")) return;
    try {
      await api.delete(`/api/team/members/${id}`);
      toast.success("Member deactivated");
      load();
    } catch (err) {
      toast.error("Failed to deactivate", err instanceof ApiError ? err.message : undefined);
    }
  }

  const filteredMembers = members ? filterByActive(members, filter) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">Team</h1>
          <p className="mt-1 text-sm text-text-muted">Manage team members shown on the people page.</p>
        </div>
        <Button onClick={() => { resetForm(); setFormOpen(true); }}>
          <Plus size={16} strokeWidth={2} />
          New member
        </Button>
      </div>

      <Drawer
        open={formOpen}
        onClose={closeDrawer}
        title={editingId ? "Edit member" : "Add member"}
        description="Team members shown on the people page."
        width="640px"
      >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Name">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Title / Role">
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </Field>
              <Field label="Experience">
                <Input value={form.experience ?? ""} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
              </Field>
              <Field label="Sort order">
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
              </Field>
            </div>

            <Field label="Photo">
              <ImageUrlField value={form.photoUrl ?? ""} onChange={(url) => setForm({ ...form, photoUrl: url })} />
            </Field>

            <p className="text-xs font-semibold uppercase tracking-wider text-text-helper">Social links</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="LinkedIn URL">
                <Input
                  value={form.linkedInUrl ?? ""}
                  onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/…"
                />
              </Field>
              <Field label="Twitter / X URL">
                <Input
                  value={form.twitterUrl ?? ""}
                  onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
                  placeholder="https://x.com/…"
                />
              </Field>
              <Field label="Instagram URL">
                <Input
                  value={form.instagramUrl ?? ""}
                  onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/…"
                />
              </Field>
              <Field label="Facebook URL">
                <Input
                  value={form.facebookUrl ?? ""}
                  onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/…"
                />
              </Field>
              <Field label="Personal website">
                <Input
                  value={form.websiteUrl ?? ""}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  placeholder="https://…"
                />
              </Field>
            </div>

            <Field label="Bullet points" helper="One per line — shown on the people page">
              <textarea
                rows={3}
                value={bulletsRaw}
                onChange={(e) => setBulletsRaw(e.target.value)}
                className="w-full rounded-[4px] border border-border bg-white px-2.5 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </Field>

            <div className="flex items-center gap-6">
              <Toggle checked={form.isSpecial} onChange={(v) => setForm({ ...form, isSpecial: v })} label="Featured / founder" />
              <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
            </div>

            <div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Add member"}
              </Button>
            </div>
          </form>
      </Drawer>

      <Card>
        <CardHeader
          title="Members"
          description={members ? `${filteredMembers.length} of ${members.length}` : undefined}
          action={<ActiveFilter value={filter} onChange={setFilter} />}
        />
        {members === null && <SkeletonTable rows={4} cols={4} />}
        {members && filteredMembers.length === 0 && <EmptyState label="No team members in this view." />}
        {members && filteredMembers.length > 0 && (
          <Table>
            <TableHead columns={["Name", "Title", "Featured", "Status", ""]} />
            <tbody>
              {filteredMembers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <span className="font-semibold text-text">{m.name}</span>
                  </TableCell>
                  <TableCell muted>{m.title}</TableCell>
                  <TableCell muted>{m.isSpecial ? "Yes" : "—"}</TableCell>
                  <TableCell>
                    <Badge tone={m.isActive ? "success" : "neutral"}>{m.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(m)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(m.id)}>
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
    </div>
  );
}
