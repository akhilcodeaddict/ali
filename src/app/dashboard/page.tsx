"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { PageListItem } from "@/lib/page-types";
import {
  BookingDto,
  BookingStatus,
  ContactMessageDto,
  TestimonialDto,
  ProductDto,
  GalleryItemDto,
  TrafficSummaryDto,
} from "@/lib/types";
import { MediaFile, formatFileSize } from "@/lib/media-types";
import { AuditLogPage } from "@/lib/admin-types";
import { mediaUrl } from "@/components/media/MediaGrid";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";
import {
  FileText,
  ClipboardList,
  CalendarDays,
  Cloud,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  ChevronRight,
  UploadCloud,
  Package,
  UserPlus,
  ListPlus,
  ImagePlus,
  Globe,
  FileImage,
  ShoppingBag,
  Mail,
  MessageSquareQuote,
  Images,
  Star,
} from "lucide-react";

/* ---------------------------------- data ---------------------------------- */

interface Stats {
  pages: PageListItem[] | null;
  media: MediaFile[] | null;
  activity: AuditLogPage | null;
  bookings: BookingDto[] | null;
  contactMessages: ContactMessageDto[] | null;
  testimonials: TestimonialDto[] | null;
  products: ProductDto[] | null;
  gallery: GalleryItemDto[] | null;
  traffic: TrafficSummaryDto | null;
}

const ORDER_STATUS_STYLE: Record<BookingStatus, { bar: string; chip: string }> = {
  Pending: { bar: "bg-amber-400", chip: "bg-amber-50 text-amber-700" },
  Confirmed: { bar: "bg-sky-400", chip: "bg-sky-50 text-sky-700" },
  Completed: { bar: "bg-emerald-400", chip: "bg-emerald-50 text-emerald-700" },
  Cancelled: { bar: "bg-slate-300", chip: "bg-slate-100 text-slate-600" },
};
const ORDER_STATUSES: BookingStatus[] = ["Pending", "Confirmed", "Completed", "Cancelled"];

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-cyan-500",
];

function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/* ------------------------------- primitives ------------------------------- */

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        "flex flex-col rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]",
        className
      )}
    >
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <h2 className="text-[15px] font-bold text-heading">{title}</h2>
        {action}
      </div>
      <div className="flex-1 px-5 pb-5">{children}</div>
    </section>
  );
}

function ViewAllLink({ href, label = "View all" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="text-[13px] font-semibold text-primary transition-colors hover:text-primary-dark"
    >
      {label}
    </Link>
  );
}

function Sparkline({ points, className }: { points: number[]; className?: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${34 - ((p - min) / range) * 30}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 36" preserveAspectRatio="none" className={clsx("h-9 w-full", className)}>
      <polyline
        points={coords}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* -------------------------------- stat cards ------------------------------- */

function StatCard({
  label,
  value,
  hint,
  hintTone = "neutral",
  icon: Icon,
  iconClass,
  href,
  progress,
}: {
  label: string;
  value: string;
  hint?: React.ReactNode;
  hintTone?: "up" | "neutral" | "link";
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  iconClass: string;
  href?: string;
  progress?: number;
}) {
  const body = (
    <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-start justify-between gap-2">
        <div className={clsx("flex h-9 w-9 items-center justify-center rounded-lg", iconClass)}>
          <Icon size={17} strokeWidth={1.75} />
        </div>
      </div>
      <p className="mt-3 text-[13px] font-medium text-text-muted">{label}</p>
      <p className="mt-0.5 text-[24px] font-bold leading-tight text-heading">{value}</p>
      {hint && (
        <p
          className={clsx(
            "mt-1 text-xs font-medium",
            hintTone === "up" && "text-status-success-text",
            hintTone === "neutral" && "text-text-helper",
            hintTone === "link" && "text-primary"
          )}
        >
          {hint}
        </p>
      )}
      {progress != null && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-status-neutral-bg">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

/* --------------------------------- kanban --------------------------------- */

const KANBAN_COLUMNS: {
  status: PageListItem["status"];
  label: string;
  tint: string;
  chip: string;
}[] = [
  { status: "Draft", label: "Draft", tint: "bg-slate-50", chip: "bg-slate-200/70 text-slate-600" },
  { status: "Review", label: "Review", tint: "bg-amber-50/70", chip: "bg-amber-100 text-amber-700" },
  { status: "Scheduled", label: "Scheduled", tint: "bg-sky-50/70", chip: "bg-sky-100 text-sky-700" },
  { status: "Published", label: "Published", tint: "bg-emerald-50/60", chip: "bg-emerald-100 text-emerald-700" },
];

function KanbanCard({ page }: { page: PageListItem }) {
  return (
    <Link
      href={`/dashboard/pages/${page.id}`}
      className="group block rounded-lg border border-border bg-surface p-3 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-[13px] font-semibold text-heading">{page.title}</p>
        <MoreHorizontal size={14} className="shrink-0 text-text-helper opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-0.5 truncate text-xs text-text-helper">/{page.slug}</p>
      <span
        className={clsx(
          "mt-2.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white",
          avatarColor(page.title)
        )}
      >
        {page.title.charAt(0).toUpperCase()}
      </span>
    </Link>
  );
}

/* --------------------------------- page ----------------------------------- */

export default function DashboardHomePage() {
  const { name, can } = useAuth();
  const [stats, setStats] = useState<Stats>({
    pages: null,
    media: null,
    activity: null,
    bookings: null,
    contactMessages: null,
    testimonials: null,
    products: null,
    gallery: null,
    traffic: null,
  });

  useEffect(() => {
    const reject = () => Promise.reject(new Error("skipped"));
    Promise.allSettled([
      api.get<PageListItem[]>("/api/pages"),
      api.get<MediaFile[]>("/api/media"),
      can("audit.view") ? api.get<AuditLogPage>("/api/audit-logs?pageSize=5") : reject(),
      api.get<BookingDto[]>("/api/bookings"),
      can("contact.view") ? api.get<ContactMessageDto[]>("/api/contact/messages") : reject(),
      can("testimonials.view") ? api.get<TestimonialDto[]>("/api/testimonials/all") : reject(),
      can("products.view") ? api.get<ProductDto[]>("/api/products/all") : reject(),
      can("gallery.view") ? api.get<GalleryItemDto[]>("/api/gallery/all") : reject(),
      api.get<TrafficSummaryDto>("/api/analytics/summary?days=30"),
    ]).then(([pages, media, activity, bookings, contactMessages, testimonials, products, gallery, traffic]) => {
      setStats({
        pages: pages.status === "fulfilled" ? pages.value : [],
        media: media.status === "fulfilled" ? media.value : [],
        activity: activity.status === "fulfilled" ? activity.value : null,
        bookings: bookings.status === "fulfilled" ? bookings.value : [],
        contactMessages: contactMessages.status === "fulfilled" ? contactMessages.value : null,
        testimonials: testimonials.status === "fulfilled" ? testimonials.value : null,
        products: products.status === "fulfilled" ? products.value : null,
        gallery: gallery.status === "fulfilled" ? gallery.value : null,
        traffic: traffic.status === "fulfilled" ? traffic.value : null,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstName = name?.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const pages = stats.pages ?? [];
  const draftPages = pages.filter((p) => p.status === "Draft");
  const reviewPages = pages.filter((p) => p.status === "Review");
  const scheduledPages = pages.filter((p) => p.status === "Scheduled");

  const today = new Date().toDateString();
  const createdToday = pages.filter((p) => new Date(p.createdAt).toDateString() === today).length;

  const storageBytes = (stats.media ?? []).reduce((sum, f) => sum + f.fileSize, 0);
  const storageGb = storageBytes / (1024 * 1024 * 1024);
  const storagePct = Math.round((storageGb / 20) * 100);

  const bookings = stats.bookings ?? [];
  const pendingOrders = bookings.filter((b) => b.status === "Pending").length;
  const orderCounts = ORDER_STATUSES.map((status) => ({
    status,
    count: bookings.filter((b) => b.status === status).length,
  }));
  const maxOrderCount = Math.max(1, ...orderCounts.map((o) => o.count));

  const myWork = useMemo(() => {
    const items: { title: string; slug: string; due: string }[] = [];
    reviewPages.forEach((p) => items.push({ title: `Approve ${p.title}`, slug: `/${p.slug}`, due: "Due today" }));
    draftPages.forEach((p) => items.push({ title: `Review ${p.title}`, slug: `/${p.slug}`, due: "Tomorrow" }));
    scheduledPages.forEach((p) => items.push({ title: `Publish ${p.title}`, slug: `/${p.slug}`, due: "In 2 days" }));
    return items.slice(0, 5);
  }, [draftPages, reviewPages, scheduledPages]);

  const recentUploads = (stats.media ?? [])
    .filter((f) => !f.isDeleted)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  const quickActions = [
    { label: "New Page", icon: Plus, href: "/dashboard/pages" },
    { label: "Upload Media", icon: UploadCloud, href: "/dashboard/media" },
    { label: "Create Product", icon: Package, href: "/dashboard/products" },
    { label: "Add New User", icon: UserPlus, href: "/dashboard/users" },
    { label: "Add Gallery Item", icon: ListPlus, href: "/dashboard/gallery" },
    { label: "Create Banner", icon: ImagePlus, href: "/dashboard/hero" },
    { label: "Publish Site", icon: Globe, soon: true },
  ];

  const traffic = stats.traffic;
  const unreadMessages = (stats.contactMessages ?? []).filter((m) => !m.isRead).length;
  const pendingTestimonials = (stats.testimonials ?? []).filter((t) => t.approvalStatus === "Pending").length;
  const approvedTestimonials = (stats.testimonials ?? []).filter((t) => t.approvalStatus === "Approved");
  const averageRating = approvedTestimonials.length > 0
    ? approvedTestimonials.reduce((sum, t) => sum + t.rating, 0) / approvedTestimonials.length
    : null;
  const activeProducts = (stats.products ?? []).filter((p) => p.isActive).length;
  const activeGalleryItems = (stats.gallery ?? []).filter((g) => g.isActive).length;

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const analytics = traffic
    ? [
        { label: "Visitors (30d)", value: traffic.totalVisits.toLocaleString(), points: traffic.dailyVisits },
        { label: "Page Views (30d)", value: traffic.totalPageViews.toLocaleString(), points: traffic.dailyPageViews },
        { label: "Avg. Session", value: formatDuration(traffic.avgSessionDurationSeconds), points: traffic.dailyVisits },
        { label: "Bounce Rate", value: `${traffic.bounceRatePercent}%`, points: traffic.dailyPageViews },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-heading">
            {greeting}{firstName ? `, ${firstName}` : ""}! 👋
          </h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Here&apos;s what&apos;s happening with your site today.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-7">
        <StatCard
          label="Draft Content"
          value={stats.pages ? String(draftPages.length) : "—"}
          hint={createdToday > 0 ? `↑ ${createdToday} today` : "Across pages"}
          hintTone={createdToday > 0 ? "up" : "neutral"}
          icon={FileText}
          iconClass="bg-blue-50 text-blue-600"
          href="/dashboard/pages"
        />
        <StatCard
          label="Pending Reviews"
          value={stats.pages ? String(reviewPages.length) : "—"}
          hint="Awaiting approval"
          icon={ClipboardList}
          iconClass="bg-amber-50 text-amber-600"
          href="/dashboard/pages"
        />
        <StatCard
          label="Scheduled Posts"
          value={stats.pages ? String(scheduledPages.length) : "—"}
          hint="View calendar"
          hintTone="link"
          icon={CalendarDays}
          iconClass="bg-violet-50 text-violet-600"
          href="/dashboard/pages"
        />
        <StatCard
          label="Storage Used"
          value={stats.media ? `${storageGb.toFixed(1)} GB` : "—"}
          hint={stats.media ? `${storagePct}% of 20 GB` : undefined}
          icon={Cloud}
          iconClass="bg-sky-50 text-sky-600"
          href="/dashboard/media"
          progress={stats.media ? storagePct : undefined}
        />
        <StatCard
          label="Total Orders"
          value={stats.bookings ? String(bookings.length) : "—"}
          hint={stats.bookings ? (pendingOrders > 0 ? `${pendingOrders} pending` : "All handled") : undefined}
          hintTone={pendingOrders > 0 ? "up" : "neutral"}
          icon={ShoppingBag}
          iconClass="bg-rose-50 text-rose-600"
          href="/dashboard/bookings"
        />
        <StatCard
          label="Contact Messages"
          value={stats.contactMessages ? String(stats.contactMessages.length) : "—"}
          hint={stats.contactMessages ? (unreadMessages > 0 ? `${unreadMessages} unread` : "All read") : undefined}
          hintTone={unreadMessages > 0 ? "up" : "neutral"}
          icon={Mail}
          iconClass="bg-cyan-50 text-cyan-600"
          href="/dashboard/contact"
        />
        <StatCard
          label="Testimonials"
          value={stats.testimonials ? String(stats.testimonials.length) : "—"}
          hint={stats.testimonials ? (pendingTestimonials > 0 ? `${pendingTestimonials} awaiting approval` : "All reviewed") : undefined}
          hintTone={pendingTestimonials > 0 ? "up" : "neutral"}
          icon={MessageSquareQuote}
          iconClass="bg-fuchsia-50 text-fuchsia-600"
          href="/dashboard/testimonials"
        />
        <StatCard
          label="Avg. Rating"
          value={averageRating !== null ? averageRating.toFixed(1) : "—"}
          hint={averageRating !== null ? `From ${approvedTestimonials.length} approved review${approvedTestimonials.length === 1 ? "" : "s"}` : "No approved reviews yet"}
          icon={Star}
          iconClass="bg-amber-50 text-amber-600"
          href="/dashboard/testimonials"
        />
        <StatCard
          label="Published Content"
          value={
            stats.products && stats.gallery
              ? String(activeProducts + activeGalleryItems)
              : "—"
          }
          hint="Products + gallery, live on site"
          icon={Images}
          iconClass="bg-emerald-50 text-emerald-600"
          href="/dashboard/products"
        />
      </div>

      {/* middle row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* My Work */}
        <Panel title="My Work" action={<ViewAllLink href="/dashboard/pages" />} className="xl:col-span-3">
          <div className="flex flex-col gap-1">
            {stats.pages === null && <p className="py-4 text-sm text-text-muted">Loading…</p>}
            {stats.pages !== null && myWork.length === 0 && (
              <p className="py-4 text-sm text-text-muted">You&apos;re all caught up. 🎉</p>
            )}
            {myWork.map((task, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg px-1.5 py-2 hover:bg-section">
                <CheckCircle2 size={17} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-text">{task.title}</p>
                  <p className="truncate text-xs text-text-helper">{task.slug}</p>
                </div>
                <span
                  className={clsx(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    task.due === "Due today"
                      ? "bg-status-danger-bg text-status-danger-text"
                      : "bg-status-neutral-bg text-text-helper"
                  )}
                >
                  {task.due}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Content Workflow */}
        <Panel
          title="Content Workflow"
          action={<ViewAllLink href="/dashboard/pages" label="View board" />}
          className="xl:col-span-6"
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {KANBAN_COLUMNS.map((col) => {
              const items = pages.filter((p) => p.status === col.status);
              return (
                <div key={col.status} className={clsx("flex flex-col gap-2 rounded-lg p-2.5", col.tint)}>
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-xs font-bold text-heading">{col.label}</span>
                    <span className={clsx("rounded-full px-1.5 py-px text-[10px] font-bold", col.chip)}>
                      {stats.pages ? items.length : "…"}
                    </span>
                  </div>
                  {items.slice(0, 3).map((p) => (
                    <KanbanCard key={p.id} page={p} />
                  ))}
                  <Link
                    href="/dashboard/pages"
                    className="rounded-lg px-2 py-1.5 text-center text-xs font-semibold text-text-helper transition-colors hover:bg-surface hover:text-text"
                  >
                    + Add
                  </Link>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* right rail */}
        <div className="flex flex-col gap-6 xl:col-span-3">
          <Panel title="Quick Actions">
            <div className="flex flex-col gap-1.5">
              {quickActions.map((a) => {
                const inner = (
                  <>
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-section text-text-muted">
                      <a.icon size={14} strokeWidth={1.75} />
                    </span>
                    <span className="flex-1 text-[13px] font-semibold">{a.label}</span>
                    {a.soon ? (
                      <span className="rounded-full bg-status-neutral-bg px-1.5 py-px text-[10px] font-semibold text-text-helper">
                        Soon
                      </span>
                    ) : (
                      <ChevronRight size={14} className="text-text-helper" />
                    )}
                  </>
                );
                return a.soon ? (
                  <span
                    key={a.label}
                    className="flex cursor-default items-center gap-2.5 rounded-lg border border-border px-2.5 py-2 text-text-helper"
                  >
                    {inner}
                  </span>
                ) : (
                  <Link
                    key={a.label}
                    href={a.href!}
                    className="flex items-center gap-2.5 rounded-lg border border-border px-2.5 py-2 text-text transition-colors hover:border-primary/40 hover:bg-primary-light/40"
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          </Panel>

        </div>
      </div>

      {/* Orders overview: count + status breakdown chart, sourced from real bookings */}
      <Panel
        title="Orders Overview"
        action={<ViewAllLink href="/dashboard/bookings" label="Manage orders" />}
      >
        {stats.bookings === null ? (
          <p className="py-4 text-sm text-text-muted">Loading…</p>
        ) : bookings.length === 0 ? (
          <p className="py-4 text-sm text-text-muted">No orders yet — bookings from the website will appear here.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex items-baseline gap-2 sm:flex-col sm:items-start">
              <span className="text-[32px] font-bold leading-none text-heading">{bookings.length}</span>
              <span className="text-[13px] text-text-muted">total orders</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {orderCounts.map(({ status, count }) => (
                <div key={status} className="flex items-center gap-3">
                  <span className={clsx("w-20 shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-semibold", ORDER_STATUS_STYLE[status].chip)}>
                    {status}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-status-neutral-bg">
                    <div
                      className={clsx("h-full rounded-full transition-all", ORDER_STATUS_STYLE[status].bar)}
                      style={{ width: `${(count / maxOrderCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-[13px] font-semibold text-heading">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {/* bottom row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Recent Activity */}
        <Panel
          title="Recent Activity"
          action={can("audit.view") ? <ViewAllLink href="/dashboard/activity" /> : undefined}
          className="xl:col-span-4"
        >
          <div className="flex flex-col gap-1">
            {stats.activity === null && (
              <p className="py-4 text-sm text-text-muted">
                {can("audit.view") ? "Loading…" : "Activity log requires audit permission."}
              </p>
            )}
            {stats.activity?.items.length === 0 && (
              <p className="py-4 text-sm text-text-muted">No activity yet.</p>
            )}
            {stats.activity?.items.map((log) => {
              const who = log.userEmail?.split("@")[0] ?? "system";
              return (
                <div key={log.id} className="flex items-center gap-3 rounded-lg px-1.5 py-2 hover:bg-section">
                  <span
                    className={clsx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
                      avatarColor(who)
                    )}
                  >
                    {who.charAt(0).toUpperCase()}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[13px] text-text">
                    <span className="font-semibold capitalize">{who}</span>{" "}
                    <span className="text-text-muted">
                      {log.activity.toLowerCase()} {log.module}
                      {log.entityName ? `: ${log.entityName}` : ""}
                    </span>
                  </p>
                  <span className="shrink-0 text-[11px] text-text-helper">{relativeTime(log.timestamp)}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Analytics Overview — from self-hosted pageview tracking (last 30 days) */}
        <Panel
          title="Analytics Overview"
          action={<span className="text-[13px] font-semibold text-text-helper">Last 30 days</span>}
          className="xl:col-span-5"
        >
          {traffic === null ? (
            <p className="py-4 text-sm text-text-muted">Loading…</p>
          ) : traffic.totalVisits === 0 ? (
            <p className="py-4 text-sm text-text-muted">No visits recorded yet — traffic will appear here once the site gets its first visitors.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {analytics.map((m) => (
                <div key={m.label}>
                  <p className="text-xs font-medium text-text-muted">{m.label}</p>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <span className="text-[20px] font-bold text-heading">{m.value}</span>
                  </div>
                  <Sparkline points={m.points} className="mt-1 text-primary" />
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Recent Uploads */}
        <Panel title="Recent Uploads" action={<ViewAllLink href="/dashboard/media" />} className="xl:col-span-3">
          <div className="flex flex-col gap-2.5">
            {stats.media === null && <p className="py-4 text-sm text-text-muted">Loading…</p>}
            {stats.media !== null && recentUploads.length === 0 && (
              <p className="py-4 text-sm text-text-muted">No uploads yet.</p>
            )}
            {recentUploads.map((f) => (
              <Link key={f.id} href="/dashboard/media" className="flex items-center gap-3 rounded-lg px-1.5 py-1.5 hover:bg-section">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-section">
                  {f.thumbnailUrl || f.originalUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={mediaUrl(f.thumbnailUrl ?? f.originalUrl)}
                      alt={f.altText}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileImage size={16} className="text-text-helper" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-text">{f.fileName}</span>
                  <span className="block text-[11px] text-text-helper">
                    {formatFileSize(f.fileSize)} · {relativeTime(f.createdAt)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
