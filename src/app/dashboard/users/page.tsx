"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { AdminUserItem, RoleItem, UserStatus } from "@/lib/admin-types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Field } from "@/components/ui/Input";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Plus, Pencil, KeyRound, X } from "lucide-react";

const statusTone: Record<UserStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Suspended: "warning",
  Inactive: "neutral",
};

interface UserForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  jobTitle: string;
  department: string;
  status: UserStatus;
  roleIds: string[];
}

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  jobTitle: "",
  department: "",
  status: "Active",
  roleIds: [],
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserItem[] | null>(null);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [u, r] = await Promise.all([
        api.get<AdminUserItem[]>("/api/users"),
        api.get<RoleItem[]>("/api/roles"),
      ]);
      setUsers(u);
      setRoles(r);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load users.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(user: AdminUserItem) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone ?? "",
      jobTitle: user.jobTitle ?? "",
      department: user.department ?? "",
      status: user.status,
      roleIds: user.roles.map((r) => r.id),
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/api/users/${editingId}`, {
          name: form.name,
          phone: form.phone || null,
          jobTitle: form.jobTitle || null,
          department: form.department || null,
          avatarUrl: null,
          status: form.status,
          roleIds: form.roleIds,
        });
      } else {
        await api.post("/api/users", {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || null,
          jobTitle: form.jobTitle || null,
          department: form.department || null,
          roleIds: form.roleIds,
        });
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save user.");
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword(user: AdminUserItem) {
    const newPassword = window.prompt(`New password for ${user.email} (min 8 chars):`);
    if (!newPassword) return;
    try {
      await api.post(`/api/users/${user.id}/reset-password`, { newPassword });
      window.alert("Password updated.");
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Failed to reset password.");
    }
  }

  function toggleRole(roleId: string) {
    setForm((f) => ({
      ...f,
      roleIds: f.roleIds.includes(roleId)
        ? f.roleIds.filter((id) => id !== roleId)
        : [...f.roleIds, roleId],
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">Users</h1>
          <p className="mt-1 text-sm text-text-muted">Team accounts, roles, and access.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} strokeWidth={2} />
          New user
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <CardHeader title="All users" description={users ? `${users.length} total` : undefined} />
        {users === null && <SkeletonTable rows={4} cols={4} />}
        {users && users.length === 0 && <EmptyState label="No users yet." />}
        {users && users.length > 0 && (
          <Table>
            <TableHead columns={["Name", "Roles", "Status", "Last login", ""]} />
            <tbody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <span className="font-semibold text-text">{user.name}</span>
                    <br />
                    <span className="text-xs text-text-helper">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role.id} tone={role.name === "Super Admin" ? "success" : "neutral"}>
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge tone={statusTone[user.status]}>{user.status}</Badge>
                  </TableCell>
                  <TableCell muted>
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(user)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => resetPassword(user)} title="Reset password">
                        <KeyRound size={14} strokeWidth={1.75} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {formOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setFormOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card-hover)]">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[17px] font-bold text-text">
                  {editingId ? "Edit user" : "New user"}
                </h2>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="text-text-helper hover:text-text cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-4 px-5 py-5">
                <Field label="Full name">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </Field>
                {!editingId && (
                  <>
                    <Field label="Email">
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </Field>
                    <Field label="Initial password" helper="Minimum 8 characters">
                      <Input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        minLength={8}
                      />
                    </Field>
                  </>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Phone">
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </Field>
                  <Field label="Job title">
                    <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
                  </Field>
                </div>
                <Field label="Department">
                  <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </Field>

                {editingId && (
                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </Field>
                )}

                <Field label="Roles">
                  <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
                    {roles.map((role) => (
                      <label key={role.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.roleIds.includes(role.id)}
                          onChange={() => toggleRole(role.id)}
                          className="h-4 w-4 accent-primary"
                        />
                        <span className="font-medium text-text">{role.name}</span>
                        {role.description && (
                          <span className="text-xs text-text-helper">— {role.description}</span>
                        )}
                      </label>
                    ))}
                  </div>
                </Field>

                {formError && (
                  <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">{formError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
                <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create user"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
