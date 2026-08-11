"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { api, ApiError } from "@/lib/api";
import { JobApplicationDto, JobApplicationStatus, JobPostingDto, UpsertJobPostingDto } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ActiveFilter, ActiveFilterValue, filterByActive } from "@/components/ui/ActiveFilter";
import { Drawer } from "@/components/ui/Drawer";
import { Plus, Pencil, Trash2 } from "lucide-react";

const emptyJob: UpsertJobPostingDto = {
  title: "",
  department: "",
  location: "",
  type: "Full-time",
  shortDescription: "",
  description: "",
  requirements: "",
  isActive: true,
};

const statusTone: Record<JobApplicationStatus, "success" | "warning" | "neutral"> = {
  Shortlisted: "success",
  Reviewed: "warning",
  Pending: "neutral",
  Rejected: "neutral",
};

export default function CareersPage() {
  const [tab, setTab] = useState<"jobs" | "applications">("jobs");
  const [jobs, setJobs] = useState<JobPostingDto[] | null>(null);
  const [applications, setApplications] = useState<JobApplicationDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertJobPostingDto>(emptyJob);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [jobFilter, setJobFilter] = useState<ActiveFilterValue>("active");
  const [formOpen, setFormOpen] = useState(false);

  async function loadJobs() {
    try {
      setJobs(await api.get<JobPostingDto[]>("/api/careers/jobs/all"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load jobs.");
    }
  }

  async function loadApplications() {
    try {
      setApplications(await api.get<JobApplicationDto[]>("/api/careers/applications"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load applications.");
    }
  }

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, []);

  function startEdit(job: JobPostingDto) {
    setEditingId(job.id);
    setForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      shortDescription: job.shortDescription,
      description: job.description,
      requirements: job.requirements,
      isActive: job.isActive,
    });
    setFormOpen(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyJob);
  }

  function closeDrawer() {
    setFormOpen(false);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) await api.put(`/api/careers/jobs/${editingId}`, form);
    else await api.post("/api/careers/jobs", form);
    setFormOpen(false);
    resetForm();
    loadJobs();
  }

  async function handleDeleteJob(id: string) {
    if (!window.confirm("Deactivate this job posting? It will be hidden from the careers page but can be reactivated later.")) return;
    await api.delete(`/api/careers/jobs/${id}`);
    loadJobs();
  }

  async function updateStatus(id: string, status: JobApplicationStatus) {
    await api.put(`/api/careers/applications/${id}/status`, status);
    loadApplications();
  }

  async function handleDeleteApplication(id: string) {
    if (!window.confirm("Delete this application?")) return;
    await api.delete(`/api/careers/applications/${id}`);
    loadApplications();
  }

  const filteredJobs = jobs ? filterByActive(jobs, jobFilter) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-text">Careers</h1>
          <p className="mt-1 text-sm text-text-muted">Manage job postings and review applications.</p>
        </div>
        {tab === "jobs" && (
          <Button onClick={() => { resetForm(); setFormOpen(true); }}>
            <Plus size={16} strokeWidth={2} />
            New job posting
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["jobs", "applications"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "px-4 py-2 text-sm font-semibold capitalize transition-colors",
              tab === t ? "border-b-2 border-primary text-primary" : "text-text-muted hover:text-text"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {tab === "jobs" && (
        <>
          <Drawer
            open={formOpen}
            onClose={closeDrawer}
            title={editingId ? "Edit job posting" : "Add job posting"}
            description="Job openings shown on the careers page."
            width="640px"
          >
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Title">
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </Field>
                  <Field label="Department">
                    <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
                  </Field>
                  <Field label="Location">
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                  </Field>
                  <Field label="Type">
                    <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
                  </Field>
                </div>
                <Field label="Short description">
                  <Input
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Full description">
                  <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </Field>
                <Field label="Requirements">
                  <Textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} required />
                </Field>
                <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
                <div>
                  <Button type="submit">{editingId ? "Save changes" : "Add job posting"}</Button>
                </div>
              </form>
          </Drawer>

          <Card>
            <CardHeader
              title="All postings"
              description={jobs ? `${filteredJobs.length} of ${jobs.length}` : undefined}
              action={<ActiveFilter value={jobFilter} onChange={setJobFilter} />}
            />
            {jobs === null && <SkeletonTable rows={4} cols={4} />}
            {jobs && filteredJobs.length === 0 && <EmptyState label="No job postings in this view." />}
            {jobs && filteredJobs.length > 0 && (
              <Table>
                <TableHead columns={["Title", "Department", "Location", "Status", ""]} />
                <tbody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <span className="font-semibold text-text">{job.title}</span>
                      </TableCell>
                      <TableCell muted>{job.department}</TableCell>
                      <TableCell muted>{job.location}</TableCell>
                      <TableCell>
                        <Badge tone={job.isActive ? "success" : "neutral"}>
                          {job.isActive ? "Active" : "Closed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => startEdit(job)}>
                            <Pencil size={14} strokeWidth={1.75} />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteJob(job.id)}>
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
      )}

      {tab === "applications" && (
        <Card>
          <CardHeader title="Applications" description={applications ? `${applications.length} total` : undefined} />
          {applications === null && <SkeletonTable rows={4} cols={4} />}
          {applications && applications.length === 0 && <EmptyState label="No applications yet." />}
          {applications && applications.length > 0 && (
            <Table>
              <TableHead columns={["Applicant", "Contact", "Resume", "Status", ""]} />
              <tbody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <span className="font-semibold text-text">{application.fullName}</span>
                    </TableCell>
                    <TableCell muted>
                      {application.email}
                      <br />
                      {application.phone}
                    </TableCell>
                    <TableCell>
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        View
                      </a>
                    </TableCell>
                    <TableCell>
                      <select
                        value={application.status}
                        onChange={(e) => updateStatus(application.id, e.target.value as JobApplicationStatus)}
                        className="rounded-[4px] border border-border bg-white px-2 py-1 text-xs font-semibold"
                      >
                        {(["Pending", "Reviewed", "Shortlisted", "Rejected"] as const).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <Badge tone={statusTone[application.status]} className="ml-2">
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteApplication(application.id)}>
                        <Trash2 size={14} strokeWidth={1.75} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
}
