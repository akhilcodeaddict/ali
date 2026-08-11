"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { TestimonialDto, UpsertTestimonialDto, ProductDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { ActiveFilter, ActiveFilterValue, filterByActive } from "@/components/ui/ActiveFilter";
import { useToast } from "@/lib/toast-context";
import { Drawer } from "@/components/ui/Drawer";
import { Plus, Pencil, Trash2, X, Check, Mail, UploadCloud, Copy, CopyCheck } from "lucide-react";

const empty: UpsertTestimonialDto = {
  name: "",
  designation: "",
  message: "",
  photoUrl: "",
  rating: 5,
  isActive: true,
  displayOrder: 0,
  email: null,
  approvalStatus: "Approved",
  servicesBooked: null,
  extraImages: null,
  extraVideos: null,
};

/** Uploads any number of images through one file picker, appending each to the current list. */
function ExtraImagesField({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(fileList).map(async (file) => {
          const form = new FormData();
          form.append("file", file);
          form.append("category", "Testimonials");
          const media = await api.post<{ mediumUrl?: string | null; originalUrl: string }>("/api/media/upload", form);
          return media.mediumUrl ?? media.originalUrl;
        })
      );
      onChange([...value, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url) => (
            <div key={url} className="group relative h-16 w-16 overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-1.5 text-[13px] font-medium text-text transition-colors hover:bg-section">
        <UploadCloud size={14} strokeWidth={1.75} />
        {uploading ? "Uploading..." : "Upload images"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

type Filter = "all" | "pending" | "approved" | "rejected";

export default function TestimonialsPage() {
  const toast = useToast();
  const [items, setItems] = useState<TestimonialDto[] | null>(null);
  const [services, setServices] = useState<ProductDto[]>([]);
  const [form, setForm] = useState<UpsertTestimonialDto>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilterValue>("active");
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestLink, setRequestLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    try {
      setItems(await api.get<TestimonialDto[]>("/api/testimonials/all"));
    } catch (err) {
      toast.error("Failed to load testimonials", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => {
    load();
    api.get<ProductDto[]>("/api/products/all").then(setServices).catch(() => setServices([]));
  }, []);

  function toggleService(name: string) {
    setForm((f) => {
      const current = f.servicesBooked ?? [];
      const next = current.includes(name) ? current.filter((s) => s !== name) : [...current, name];
      return { ...f, servicesBooked: next.length > 0 ? next : null };
    });
  }

  function startEdit(t: TestimonialDto) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      designation: t.designation,
      message: t.message,
      photoUrl: t.photoUrl ?? "",
      rating: t.rating,
      isActive: t.isActive,
      displayOrder: t.displayOrder,
      email: t.email ?? null,
      approvalStatus: t.approvalStatus,
      servicesBooked: t.servicesBooked ?? null,
      extraImages: t.extraImages ?? null,
      extraVideos: t.extraVideos ?? null,
    });
    setFormOpen(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(empty);
  }

  function closeDrawer() {
    setFormOpen(false);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/api/testimonials/${editingId}`, form);
      else await api.post("/api/testimonials", form);
      toast.success(editingId ? "Testimonial updated" : "Testimonial added");
      setFormOpen(false);
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save", err instanceof ApiError ? err.message : undefined);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deactivate this testimonial? It will be hidden from the homepage but can be reactivated later.")) return;
    try {
      await api.delete(`/api/testimonials/${id}`);
      toast.success("Testimonial deactivated");
      load();
    } catch (err) {
      toast.error("Failed to deactivate", err instanceof ApiError ? err.message : undefined);
    }
  }

  async function setApproval(id: string, approvalStatus: "Approved" | "Rejected") {
    try {
      await api.patch(`/api/testimonials/${id}/approval`, { approvalStatus });
      toast.success(approvalStatus === "Approved" ? "Testimonial approved" : "Testimonial rejected");
      load();
    } catch (err) {
      toast.error("Failed to update approval", err instanceof ApiError ? err.message : undefined);
    }
  }

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault();
    setSendingRequest(true);
    setLinkCopied(false);
    try {
      const result = await api.post<{ link: string }>("/api/testimonials/send-request", { name: requestName, email: requestEmail });
      toast.success("Testimonial request sent");
      setRequestLink(result.link);
      setRequestName("");
      setRequestEmail("");
    } catch (err) {
      toast.error("Failed to send request", err instanceof ApiError ? err.message : undefined);
    } finally {
      setSendingRequest(false);
    }
  }

  async function copyRequestLink() {
    if (!requestLink) return;
    await navigator.clipboard.writeText(requestLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const pendingCount = items?.filter((t) => t.approvalStatus === "Pending").length ?? 0;
  const filtered = items && filterByActive(items, activeFilter).filter((t) => {
    if (filter === "all") return true;
    if (filter === "pending") return t.approvalStatus === "Pending";
    if (filter === "approved") return t.approvalStatus === "Approved";
    return t.approvalStatus === "Rejected";
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">Testimonials</h1>
          <p className="mt-1 text-sm text-text-muted">
            Client quotes shown on the homepage{pendingCount > 0 && ` — ${pendingCount} awaiting approval`}.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setFormOpen(true); }}>
          <Plus size={16} strokeWidth={2} />
          New testimonial
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Request a testimonial"
          description="For customers with no booking on file — emails them the review link directly."
        />
        <CardBody>
          <form onSubmit={handleSendRequest} className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Name">
                <Input value={requestName} onChange={(e) => setRequestName(e.target.value)} required />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Email">
                <Input type="email" value={requestEmail} onChange={(e) => setRequestEmail(e.target.value)} required />
              </Field>
            </div>
            <Button type="submit" disabled={sendingRequest}>
              <Mail size={14} strokeWidth={1.75} />
              {sendingRequest ? "Sending..." : "Send request"}
            </Button>
          </form>

          {requestLink && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-section px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate text-[13px] text-text-muted">{requestLink}</span>
              <Button variant="secondary" size="sm" onClick={copyRequestLink}>
                {linkCopied ? (
                  <>
                    <CopyCheck size={14} strokeWidth={1.75} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} strokeWidth={1.75} />
                    Copy link
                  </>
                )}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <Drawer
        open={formOpen}
        onClose={closeDrawer}
        title={editingId ? "Edit testimonial" : "Add testimonial"}
        description="Client quotes shown on the homepage."
        width="640px"
      >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Name">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Designation">
                <Input
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  required
                />
              </Field>
              <Field label="Rating (1-5)">
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                />
              </Field>
              <Field label="Photo">
                <ImageUrlField
                  value={form.photoUrl ?? ""}
                  onChange={(url) => setForm({ ...form, photoUrl: url })}
                />
              </Field>
            </div>
            <Field label="Message">
              <Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </Field>
            <Field
              label="Services booked"
              helper="Defaults to what the customer selected on the review-request link (if any) — add or remove as needed."
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {services.map((s) => {
                  const checked = (form.servicesBooked ?? []).includes(s.name);
                  return (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-[13px] transition-colors ${
                        checked ? "border-primary bg-primary-light/40 text-text" : "border-border text-text-muted hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleService(s.name)}
                        className="h-4 w-4 shrink-0 accent-primary"
                      />
                      <span className="truncate">{s.name}</span>
                    </label>
                  );
                })}
                {services.length === 0 && (
                  <p className="text-xs text-text-helper">No services found.</p>
                )}
              </div>
            </Field>
            <Field label="Extra photos" helper="Upload any number of additional photos for this review.">
              <ExtraImagesField
                value={form.extraImages ?? []}
                onChange={(urls) => setForm({ ...form, extraImages: urls.length > 0 ? urls : null })}
              />
            </Field>
            <div className="flex items-center gap-6">
              <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
              <Field label="Display order">
                <Input
                  type="number"
                  className="w-24"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                />
              </Field>
            </div>
            <div>
              <Button type="submit">{editingId ? "Save changes" : "Add testimonial"}</Button>
            </div>
          </form>
      </Drawer>

      <Card>
        <CardHeader
          title="All testimonials"
          description={items ? `${filtered?.length ?? 0} of ${items.length}` : undefined}
          action={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {(["all", "pending", "approved", "rejected"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                      filter === f ? "bg-primary text-white" : "text-text-muted hover:bg-surface-hover"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <ActiveFilter value={activeFilter} onChange={setActiveFilter} />
            </div>
          }
        />
        {items === null && <SkeletonTable rows={4} cols={4} />}
        {items && filtered && filtered.length === 0 && <EmptyState label="No testimonials in this view." />}
        {items && filtered && filtered.length > 0 && (
          <Table>
            <TableHead columns={["Name", "Details", "Rating", "Status", "Approval", ""]} />
            <tbody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <span className="font-semibold text-text">{t.name}</span>
                    {t.email && <p className="text-xs text-text-muted">{t.email}</p>}
                  </TableCell>
                  <TableCell muted>
                    <p>{t.designation}</p>
                    {t.servicesBooked && t.servicesBooked.length > 0 && (
                      <p className="mt-0.5 max-w-[220px] truncate text-xs" title={t.servicesBooked.join(", ")}>
                        {t.servicesBooked.join(", ")}
                      </p>
                    )}
                  </TableCell>
                  <TableCell muted>{t.rating} / 5</TableCell>
                  <TableCell>
                    <Badge tone={t.isActive ? "success" : "neutral"}>
                      {t.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      tone={
                        t.approvalStatus === "Approved"
                          ? "success"
                          : t.approvalStatus === "Rejected"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {t.approvalStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t.approvalStatus !== "Approved" && (
                        <Button variant="secondary" size="sm" onClick={() => setApproval(t.id, "Approved")} title="Approve">
                          <Check size={14} strokeWidth={1.75} />
                        </Button>
                      )}
                      {t.approvalStatus !== "Rejected" && (
                        <Button variant="danger" size="sm" onClick={() => setApproval(t.id, "Rejected")} title="Reject">
                          <X size={14} strokeWidth={1.75} />
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" onClick={() => startEdit(t)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(t.id)}>
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
