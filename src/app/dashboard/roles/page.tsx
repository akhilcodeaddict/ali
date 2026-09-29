"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { RoleItem } from "@/lib/admin-types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Table, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Plus, Pencil, Trash2, X, Lock, ChevronLeft } from "lucide-react";

interface RoleForm {
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

const ACTIONS = ["view", "create", "update", "delete"] as const;

function permFor(perms: string[], action: string): string | undefined {
  return perms.find((p) => p.endsWith(`.${action}`));
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[] | null>(null);
  const [catalog, setCatalog] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [form, setForm] = useState<RoleForm>({ name: "", description: "", permissions: [], isActive: true });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [r, c] = await Promise.all([
        api.get<RoleItem[]>("/api/roles"),
        api.get<Record<string, string[]>>("/api/roles/permissions"),
      ]);
      setRoles(r);
      setCatalog(c);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load roles.");
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", permissions: [], isActive: true });
    setFormError(null);
    setView("form");
  }

  function openEdit(role: RoleItem) {
    setEditing(role);
    setForm({ name: role.name, description: role.description ?? "", permissions: role.permissions, isActive: role.isActive });
    setFormError(null);
    setView("form");
  }

  function backToList() { setView("list"); setEditing(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const payload = { name: form.name, description: form.description || null, permissions: form.permissions, isActive: form.isActive };
      if (editing) await api.put(`/api/roles/${editing.id}`, payload);
      else await api.post("/api/roles", payload);
      backToList();
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save role.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(role: RoleItem) {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      await api.delete(`/api/roles/${role.id}`);
      load();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Failed to delete role.");
    }
  }

  function togglePermission(perm: string) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter((p) => p !== perm)
        : [...f.permissions, perm],
    }));
  }

  function toggleRowAll(perms: string[]) {
    setForm((f) => {
      const allChecked = perms.every((p) => f.permissions.includes(p));
      return {
        ...f,
        permissions: allChecked
          ? f.permissions.filter((p) => !perms.includes(p))
          : [...new Set([...f.permissions, ...perms])],
      };
    });
  }

  function toggleColumnAll(action: string) {
    const columnPerms = Object.values(catalog)
      .flatMap((perms) => perms.filter((p) => p.endsWith(`.${action}`)));
    setForm((f) => {
      const allChecked = columnPerms.every((p) => f.permissions.includes(p));
      return {
        ...f,
        permissions: allChecked
          ? f.permissions.filter((p) => !columnPerms.includes(p))
          : [...new Set([...f.permissions, ...columnPerms])],
      };
    });
  }

  function toggleAllPermissions() {
    const all = Object.values(catalog).flat();
    setForm((f) => {
      const allChecked = all.every((p) => f.permissions.includes(p));
      return {
        ...f,
        permissions: allChecked ? [] : [...new Set(all)],
      };
    });
  }

  const isSuperAdmin = editing?.name === "Super Admin";

  if (view === "form") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={backToList}
            className="flex items-center gap-1 text-sm text-text-muted hover:text-text cursor-pointer"
          >
            <ChevronLeft size={16} />
            Roles
          </button>
          <span className="text-text-muted">/</span>
          <h1 className="text-[22px] font-bold text-heading">
            {editing ? `Edit: ${editing.name}` : "New role"}
          </h1>
        </div>

        {formError && (
          <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">{formError}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Role details" />
            <CardBody>
              <div className="flex flex-col gap-4">
                <Field label="Role name">
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={editing?.isSystem}
                    required
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </Field>
                <Toggle
                  checked={form.isActive}
                  onChange={(v) => setForm({ ...form, isActive: v })}
                  label="Active"
                  disabled={isSuperAdmin}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Permissions" description={isSuperAdmin ? "Super Admin always has every permission." : `${form.permissions.length} selected`} />
            {isSuperAdmin ? (
              <CardBody>
                <p className="text-sm text-text-muted">Super Admin always has every permission and cannot be changed.</p>
              </CardBody>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-section">
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-text-helper">
                        Module
                      </th>
                      {ACTIONS.map((a) => {
                        const colPerms = Object.values(catalog).flatMap((p) => p.filter((x) => x.endsWith(`.${a}`)));
                        const colAll = colPerms.length > 0 && colPerms.every((p) => form.permissions.includes(p));
                        return (
                          <th key={a} className="w-20 px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-text-helper">
                            <div className="flex flex-col items-center gap-1">
                              <span>{a}</span>
                              <input
                                type="checkbox"
                                checked={colAll}
                                onChange={() => toggleColumnAll(a)}
                                className="h-3.5 w-3.5 cursor-pointer accent-primary"
                                title={`Select all ${a}`}
                              />
                            </div>
                          </th>
                        );
                      })}
                      <th className="w-14 px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-text-helper">
                        <div className="flex flex-col items-center gap-1">
                          <span>All</span>
                          <input
                            type="checkbox"
                            checked={Object.values(catalog).flat().every((p) => form.permissions.includes(p))}
                            onChange={toggleAllPermissions}
                            className="h-3.5 w-3.5 cursor-pointer accent-primary"
                            title="Select all permissions"
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(catalog).map(([group, perms]) => {
                      const rowAllChecked = perms.every((p) => form.permissions.includes(p));
                      return (
                        <tr key={group} className="border-b border-border last:border-0 hover:bg-section/50">
                          <td className="px-4 py-2.5 font-medium text-text">{group}</td>
                          {ACTIONS.map((action) => {
                            const perm = permFor(perms, action);
                            return (
                              <td key={action} className="px-2 py-2.5 text-center">
                                {perm ? (
                                  <input
                                    type="checkbox"
                                    checked={form.permissions.includes(perm)}
                                    onChange={() => togglePermission(perm)}
                                    className="h-4 w-4 cursor-pointer accent-primary"
                                    title={perm}
                                  />
                                ) : (
                                  <span className="text-text-helper/40">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-2 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={rowAllChecked}
                              onChange={() => toggleRowAll(perms)}
                              className="h-4 w-4 cursor-pointer accent-primary"
                              title={`Toggle all ${group} permissions`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={backToList}>Cancel</Button>
            {!isSuperAdmin && (
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editing ? "Save changes" : "Create role"}
              </Button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-heading">Roles</h1>
          <p className="mt-1 text-sm text-text-muted">
            What each role is allowed to do. System roles cannot be deleted.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} strokeWidth={2} />
          New role
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <CardHeader title="All roles" description={roles ? `${roles.length} total` : undefined} />
        {roles === null && <SkeletonTable rows={4} cols={5} />}
        {roles && (
          <Table>
            <TableHead columns={["Role", "Permissions", "Users", "Status", ""]} />
            <tbody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-text">
                      {role.isSystem && <Lock size={12} className="text-text-helper" />}
                      {role.name}
                    </span>
                    {role.description && (
                      <>
                        <br />
                        <span className="text-xs text-text-helper">{role.description}</span>
                      </>
                    )}
                  </TableCell>
                  <TableCell muted>
                    {role.name === "Super Admin" ? "All permissions" : `${role.permissions.length} permission(s)`}
                  </TableCell>
                  <TableCell muted>{role.userCount}</TableCell>
                  <TableCell>
                    <Badge tone={role.isActive ? "success" : "neutral"}>
                      {role.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(role)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      {!role.isSystem && (
                        <Button variant="danger" size="sm" onClick={() => handleDelete(role)}>
                          <Trash2 size={14} strokeWidth={1.75} />
                        </Button>
                      )}
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
