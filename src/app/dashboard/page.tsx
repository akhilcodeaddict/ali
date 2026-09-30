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
import { MediaFile } from "@/lib/media-types";
import { AuditLogPage } from "@/lib/admin-types";
import { mediaUrl } from "@/components/media/MediaGrid";
import clsx from "clsx";
import {
  FileText,
  ClipboardList,
  CalendarDays,
  Cloud,
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
  Star,
  Camera,
  TrendingUp,
  TrendingDown,
  Image,
  LayoutDashboard,
  Settings,
} from "lucide-react";

/* ─── types ──────────────────────────────────────────────────────────────── */

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
  "bg-blue-500", "bg-amber-500", "bg-violet-500",
  "bg-emerald-500", "bg-rose-500", "bg-cyan-500",
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

/* stable seeded sparkline so it doesn't flicker */
function seededSparkline(seed: number, len = 8): number[] {
  const pts: number[] = [];
  let v = 30 + Math.abs(seed % 40);
  for (let i = 0; i < len; i++) {
    v = Math.max(8, Math.min(92, v + (((seed * 7919 * (i + 1)) % 22) - 11)));
    pts.push(v);
  }
  return pts;
}

/* ─── primitives ─────────────────────────────────────────────────────────── */

function Panel({
  title, action, children, className,
}: {
  title: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={clsx(
      "flex flex-col rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]",
      className,
    )}>
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
    <Link href={href} className="text-[13px] font-semibold text-primary transition-colors hover:text-primary-dark">
      {label} →
    </Link>
  );
}

function Sparkline({ points, className }: { points: number[]; className?: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${30 - ((p - min) / range) * 26}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={clsx("h-8 w-full", className)}>
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

/* ─── hero banner ────────────────────────────────────────────────────────── */

function HeroBanner({ greeting, firstName }: { greeting: string; firstName?: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl px-8 py-8 sm:px-12 sm:py-10"
      style={{
        backgroundImage: "url('/dashboard-hero-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center right",
        minHeight: "180px",
      }}
    >
      {/* left-side translucent overlay so text stays readable over the light bg */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(to right, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.55) 45%, transparent 75%)",
        }}
      />
      <div className="relative z-10 max-w-lg">
        <h1 className="text-[26px] font-bold leading-tight text-gray-900 sm:text-[32px]">
          {greeting},
          <br />
          {firstName ?? "Administrator"}! 👋
        </h1>
        <p className="mt-2 text-[14px] text-gray-600">
          Manage your website content, media, and more from one place.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard/pages"
            className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-700"
          >
            <Plus size={14} strokeWidth={2} /> Create New Page
          </Link>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-white"
          >
            <Globe size={14} strokeWidth={1.75} /> View Website
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── stat card ──────────────────────────────────────────────────────────── */

function StatCard({
  label, value, trend, trendUp, subtext, icon: Icon, iconClass, href, progress, sparkSeed,
}: {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean | null;
  subtext?: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  iconClass: string;
  href?: string;
  progress?: number;
  sparkSeed?: number;
}) {
  const spark = sparkSeed != null ? seededSparkline(sparkSeed) : null;

  const body = (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-start justify-between gap-2">
        <div className={clsx("flex h-9 w-9 items-center justify-center rounded-xl", iconClass)}>
          <Icon size={17} strokeWidth={1.75} />
        </div>
        {trend && (
          <span className={clsx(
            "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold",
            trendUp === true && "bg-emerald-50 text-emerald-600",
            trendUp === false && "bg-red-50 text-red-600",
            trendUp == null && "bg-slate-100 text-slate-500",
          )}>
            {trendUp === true && <TrendingUp size={10} />}
            {trendUp === false && <TrendingDown size={10} />}
            {trend}
          </span>
        )}
      </div>
      <p className="mt-3 text-[13px] font-medium text-text-muted">{label}</p>
      <p className="mt-0.5 text-[22px] font-bold leading-tight text-heading">{value}</p>
      {subtext && <p className="mt-0.5 text-xs text-text-helper">{subtext}</p>}
      {progress != null && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-status-neutral-bg">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
      {spark && !progress && (
        <div className="mt-auto pt-2">
          <Sparkline
            points={spark}
            className={clsx(
              trendUp === true && "text-emerald-500",
              trendUp === false && "text-red-400",
              trendUp == null && "text-primary",
            )}
          />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href} className="block h-full">{body}</Link> : body;
}

/* ─── kanban ─────────────────────────────────────────────────────────────── */

const KANBAN_COLUMNS: { status: PageListItem["status"]; label: string; tint: string; chip: string }[] = [
  { status: "Draft", label: "Draft", tint: "bg-slate-50 dark:bg-slate-800/40", chip: "bg-slate-200/70 text-slate-600" },
  { status: "Review", label: "Review", tint: "bg-amber-50/70 dark:bg-amber-900/20", chip: "bg-amber-100 text-amber-700" },
  { status: "Scheduled", label: "Scheduled", tint: "bg-sky-50/70 dark:bg-sky-900/20", chip: "bg-sky-100 text-sky-700" },
  { status: "Published", label: "Published", tint: "bg-emerald-50/60 dark:bg-emerald-900/20", chip: "bg-emerald-100 text-emerald-700" },
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
      <p className="mt-0.5 truncate text-xs text-text-helper">{page.slug ? `/${page.slug}` : "Page"}</p>
    </Link>
  );
}

/* ─── orders bar chart ───────────────────────────────────────────────────── */

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function MonthlyBarChart({ bookings }: { bookings: BookingDto[] }) {
  const now = new Date();
  const data = MONTHS_SHORT.map((m, idx) => {
    const count = bookings.filter((b) => {
      const d = new Date(b.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === idx;
    }).length;
    return { month: m, count };
  });
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex h-28 items-end gap-1.5">
      {data.map((d, i) => (
        <div key={i} className="group relative flex flex-1 flex-col items-center gap-1">
          {d.count > 0 && (
            <span className="absolute -top-5 hidden rounded bg-heading px-1 py-px text-[9px] font-bold text-surface group-hover:block">
              {d.count}
            </span>
          )}
          <div
            className={clsx(
              "w-full min-h-[3px] rounded-t transition-all",
              i === now.getMonth() ? "bg-primary" : "bg-primary/35 hover:bg-primary/60"
            )}
            style={{ height: `${Math.max(3, (d.count / max) * 100)}%` }}
          />
          <span className="text-[9px] text-text-helper">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── quick-action colored icons ─────────────────────────────────────────── */

const QUICK_ACTIONS = [
  { label: "New Page", icon: FileText, href: "/dashboard/pages", bg: "bg-blue-50 text-blue-600" },
  { label: "Upload Media", icon: UploadCloud, href: "/dashboard/media", bg: "bg-violet-50 text-violet-600" },
  { label: "Create Product", icon: Package, href: "/dashboard/products", bg: "bg-amber-50 text-amber-600" },
  { label: "Add New User", icon: UserPlus, href: "/dashboard/users", bg: "bg-rose-50 text-rose-600" },
  { label: "Add Gallery Item", icon: ListPlus, href: "/dashboard/gallery", bg: "bg-emerald-50 text-emerald-600" },
  { label: "Create Banner", icon: ImagePlus, href: "/dashboard/banners", bg: "bg-cyan-50 text-cyan-600" },
] as const;

/* ─── my-work icon ───────────────────────────────────────────────────────── */

function workIcon(slug: string) {
  if (slug.includes("page")) return { Icon: FileText, cls: "bg-blue-50 text-blue-600" };
  if (slug.includes("gallery")) return { Icon: Image, cls: "bg-orange-50 text-orange-500" };
  if (slug.includes("contact")) return { Icon: Mail, cls: "bg-red-50 text-red-500" };
  if (slug.includes("product")) return { Icon: Package, cls: "bg-amber-50 text-amber-600" };
  if (slug.includes("review") || slug.includes("approve")) return { Icon: ClipboardList, cls: "bg-violet-50 text-violet-600" };
  return { Icon: LayoutDashboard, cls: "bg-teal-50 text-teal-600" };
}

/* ─── page ───────────────────────────────────────────────────────────────── */

export default function DashboardHomePage() {
  const { name, can } = useAuth();
  const [stats, setStats] = useState<Stats>({
    pages: null, media: null, activity: null, bookings: null,
    contactMessages: null, testimonials: null, products: null,
    gallery: null, traffic: null,
  });

  useEffect(() => {
    const skip = () => Promise.reject(new Error("skipped"));
    Promise.allSettled([
      api.get<PageListItem[]>("/api/pages"),
      api.get<MediaFile[]>("/api/media"),
      can("audit.view") ? api.get<AuditLogPage>("/api/audit-logs?pageSize=6") : skip(),
      api.get<BookingDto[]>("/api/bookings"),
      can("contact.view") ? api.get<ContactMessageDto[]>("/api/contact/messages") : skip(),
      can("testimonials.view") ? api.get<TestimonialDto[]>("/api/testimonials/all") : skip(),
      can("products.view") ? api.get<ProductDto[]>("/api/products/all") : skip(),
      can("gallery.view") ? api.get<GalleryItemDto[]>("/api/gallery/all") : skip(),
      api.get<TrafficSummaryDto>("/api/analytics/summary?days=30"),
    ]).then(([pages, media, activity, bookings, msgs, testimonials, products, gallery, traffic]) => {
      setStats({
        pages: pages.status === "fulfilled" ? pages.value : [],
        media: media.status === "fulfilled" ? media.value : [],
        activity: activity.status === "fulfilled" ? activity.value : null,
        bookings: bookings.status === "fulfilled" ? bookings.value : [],
        contactMessages: msgs.status === "fulfilled" ? msgs.value : null,
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
    const items: { title: string; type: string; time: string }[] = [];
    reviewPages.forEach((p) => items.push({ title: `Approve "${p.title}"`, type: "Pages", time: "Due today" }));
    draftPages.forEach((p) => items.push({ title: `Review "${p.title}"`, type: "Pages", time: "Tomorrow" }));
    scheduledPages.forEach((p) => items.push({ title: `Schedule "${p.title}"`, type: "Pages", time: "In 2 days" }));
    return items.slice(0, 5);
  }, [draftPages, reviewPages, scheduledPages]);

  const recentUploads = (stats.media ?? [])
    .filter((f) => !f.isDeleted)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const unreadMessages = (stats.contactMessages ?? []).filter((m) => !m.isRead).length;
  const pendingTestimonials = (stats.testimonials ?? []).filter((t) => t.approvalStatus === "Pending").length;

  const traffic = stats.traffic;

  function formatDuration(s: number) {
    const m = Math.floor(s / 60);
    return `${m}:${Math.round(s % 60).toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── hero banner ── */}
      <HeroBanner greeting={greeting} firstName={firstName} />

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-7">
        <StatCard
          label="Draft Content"
          value={stats.pages ? String(draftPages.length) : "—"}
          trend={createdToday > 0 ? `+${createdToday} today` : undefined}
          trendUp={createdToday > 0 ? true : null}
          subtext="Across pages"
          icon={FileText}
          iconClass="bg-blue-50 text-blue-600"
          href="/dashboard/pages"
          sparkSeed={draftPages.length + 12}
        />
        <StatCard
          label="Pending Reviews"
          value={stats.pages ? String(reviewPages.length) : "—"}
          trend={reviewPages.length > 0 ? `+${reviewPages.length}` : undefined}
          trendUp={reviewPages.length > 0 ? true : null}
          subtext="Awaiting approval"
          icon={ClipboardList}
          iconClass="bg-amber-50 text-amber-600"
          href="/dashboard/pages"
          sparkSeed={reviewPages.length + 5}
        />
        <StatCard
          label="Scheduled Posts"
          value={stats.pages ? String(scheduledPages.length) : "—"}
          subtext="View calendar"
          icon={CalendarDays}
          iconClass="bg-violet-50 text-violet-600"
          href="/dashboard/pages"
          sparkSeed={scheduledPages.length + 3}
        />
        <StatCard
          label="Storage Used"
          value={stats.media ? `${storageGb.toFixed(1)} GB` : "—"}
          subtext={stats.media ? `${storagePct}% of 20 GB` : undefined}
          icon={Cloud}
          iconClass="bg-sky-50 text-sky-600"
          href="/dashboard/media"
          progress={stats.media ? storagePct : undefined}
        />
        <StatCard
          label="Total Orders"
          value={stats.bookings ? String(bookings.length) : "—"}
          trend={pendingOrders > 0 ? `${pendingOrders} pending` : undefined}
          trendUp={pendingOrders > 0 ? true : null}
          subtext={pendingOrders > 0 ? undefined : "All handled"}
          icon={ShoppingBag}
          iconClass="bg-rose-50 text-rose-600"
          href="/dashboard/bookings"
          sparkSeed={bookings.length + 28}
        />
        <StatCard
          label="Contact Messages"
          value={stats.contactMessages ? String(stats.contactMessages.length) : "—"}
          trend={unreadMessages > 0 ? `${unreadMessages} unread` : undefined}
          trendUp={unreadMessages > 0 ? true : null}
          subtext={unreadMessages > 0 ? undefined : "All read"}
          icon={Mail}
          iconClass="bg-cyan-50 text-cyan-600"
          href="/dashboard/contact"
          sparkSeed={(stats.contactMessages?.length ?? 0) + 14}
        />
        <StatCard
          label="Testimonials"
          value={stats.testimonials ? String(stats.testimonials.length) : "—"}
          trend={pendingTestimonials > 0 ? `${pendingTestimonials} pending` : undefined}
          trendUp={pendingTestimonials > 0 ? true : null}
          subtext={pendingTestimonials > 0 ? undefined : "All reviewed"}
          icon={MessageSquareQuote}
          iconClass="bg-fuchsia-50 text-fuchsia-600"
          href="/dashboard/testimonials"
          sparkSeed={(stats.testimonials?.length ?? 0) + 7}
        />
      </div>

      {/* ── middle row: My Work / Kanban / Quick Actions ── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">

        {/* My Work */}
        <Panel title="My Work" action={<ViewAllLink href="/dashboard/pages" />} className="xl:col-span-3">
          <div className="flex flex-col gap-0.5">
            {stats.pages === null && <p className="py-4 text-sm text-text-muted">Loading…</p>}
            {stats.pages !== null && myWork.length === 0 && (
              <p className="py-4 text-sm text-text-muted">You&apos;re all caught up! 🎉</p>
            )}
            {myWork.map((task, i) => {
              const { Icon, cls } = workIcon(task.title.toLowerCase() + task.type.toLowerCase());
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-section">
                  <span className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", cls)}>
                    <Icon size={15} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-text">{task.title}</p>
                    <p className="text-xs text-text-helper">{task.type}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-text-helper">{task.time}</span>
                    <MoreHorizontal size={13} className="text-text-helper/50" />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Content Workflow kanban */}
        <Panel
          title="Content Workflow"
          action={<ViewAllLink href="/dashboard/pages" label="View board" />}
          className="xl:col-span-6"
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {KANBAN_COLUMNS.map((col) => {
              const items = pages.filter((p) => p.status === col.status);
              return (
                <div key={col.status} className={clsx("flex flex-col gap-2 rounded-xl p-2.5", col.tint)}>
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-xs font-bold text-heading">{col.label}</span>
                    <span className={clsx("rounded-full px-1.5 py-px text-[10px] font-bold", col.chip)}>
                      {stats.pages ? items.length : "…"}
                    </span>
                  </div>
                  {items.slice(0, 3).map((p) => <KanbanCard key={p.id} page={p} />)}
                  <Link
                    href="/dashboard/pages"
                    className="rounded-lg px-2 py-1.5 text-center text-xs font-semibold text-text-helper transition-colors hover:bg-surface hover:text-text"
                  >
                    + Add item
                  </Link>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Quick Actions */}
        <Panel title="Quick Actions" className="xl:col-span-3">
          <div className="flex flex-col gap-1.5">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center gap-2.5 rounded-lg border border-border px-2.5 py-2 text-text transition-colors hover:border-primary/40 hover:bg-primary-light/40"
              >
                <span className={clsx("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", a.bg)}>
                  <a.icon size={14} strokeWidth={1.75} />
                </span>
                <span className="flex-1 text-[13px] font-semibold">{a.label}</span>
                <ChevronRight size={14} className="text-text-helper" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      {/* ── Orders Overview (monthly bar chart) + Recent Activity ── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">

        {/* Monthly bar chart */}
        <Panel
          title="Orders Overview"
          action={<ViewAllLink href="/dashboard/bookings" label="Manage orders" />}
          className="xl:col-span-8"
        >
          {stats.bookings === null ? (
            <p className="py-4 text-sm text-text-muted">Loading…</p>
          ) : bookings.length === 0 ? (
            <p className="py-4 text-sm text-text-muted">
              No orders yet — bookings from the website will appear here.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {/* status breakdown chips */}
              <div className="flex flex-wrap items-center gap-2">
                {orderCounts.map(({ status, count }) => (
                  <div key={status} className="flex items-center gap-2">
                    <span className={clsx("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", ORDER_STATUS_STYLE[status].chip)}>
                      {status}: {count}
                    </span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-status-neutral-bg">
                      <div
                        className={clsx("h-full rounded-full", ORDER_STATUS_STYLE[status].bar)}
                        style={{ width: `${(count / maxOrderCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* monthly bar chart */}
              <MonthlyBarChart bookings={bookings} />
            </div>
          )}
        </Panel>

        {/* Recent Activity */}
        <Panel
          title="Recent Activity"
          action={can("audit.view") ? <ViewAllLink href="/dashboard/activity" /> : undefined}
          className="xl:col-span-4"
        >
          <div className="flex flex-col gap-0.5">
            {stats.activity === null && (
              <p className="py-4 text-sm text-text-muted">
                {can("audit.view") ? "Loading…" : "Requires audit permission."}
              </p>
            )}
            {stats.activity?.items.length === 0 && (
              <p className="py-4 text-sm text-text-muted">No activity yet.</p>
            )}
            {stats.activity?.items.map((log) => {
              const who = log.userEmail?.split("@")[0] ?? "system";
              const isSystem = !log.userEmail;
              return (
                <div key={log.id} className="flex items-center gap-3 rounded-lg px-1.5 py-2 hover:bg-section">
                  <span className={clsx(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    isSystem ? "bg-slate-100 text-slate-500" : `${avatarColor(who)} text-white`
                  )}>
                    {isSystem ? <Settings size={12} /> : who.charAt(0).toUpperCase()}
                  </span>
                  <p className="min-w-0 flex-1 text-[12px] text-text leading-snug">
                    <span className="font-semibold capitalize">{isSystem ? "System" : who}</span>{" "}
                    <span className="text-text-muted">
                      {log.activity.toLowerCase()} {log.module}
                      {log.entityName ? `: "${log.entityName}"` : ""}
                    </span>
                  </p>
                  <span className="shrink-0 text-[10px] text-text-helper whitespace-nowrap">
                    {relativeTime(log.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* ── bottom row: Analytics + Recent Uploads ── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">

        {/* Analytics Overview */}
        <Panel
          title="Analytics Overview"
          action={<span className="text-[13px] font-medium text-text-helper">Last 30 days</span>}
          className="xl:col-span-8"
        >
          {traffic === null ? (
            <p className="py-4 text-sm text-text-muted">Loading…</p>
          ) : traffic.totalVisits === 0 ? (
            <p className="py-4 text-sm text-text-muted">
              No visits recorded yet — traffic will appear here once the site gets visitors.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {[
                { label: "Visitors (30d)", value: traffic.totalVisits.toLocaleString(), points: traffic.dailyVisits, up: true },
                { label: "Page Views (30d)", value: traffic.totalPageViews.toLocaleString(), points: traffic.dailyPageViews, up: true },
                { label: "Avg. Session", value: formatDuration(traffic.avgSessionDurationSeconds), points: traffic.dailyVisits, up: true },
                { label: "Bounce Rate", value: `${traffic.bounceRatePercent}%`, points: traffic.dailyPageViews, up: false },
              ].map((m) => (
                <div key={m.label} className="flex flex-col rounded-xl border border-border bg-section p-3">
                  <p className="text-[11px] font-medium text-text-muted">{m.label}</p>
                  <p className="mt-1 text-[20px] font-bold text-heading">{m.value}</p>
                  <Sparkline
                    points={m.points}
                    className={clsx("mt-2", m.up ? "text-emerald-500" : "text-red-400")}
                  />
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Recent Uploads */}
        <Panel title="Recent Uploads" action={<ViewAllLink href="/dashboard/media" />} className="xl:col-span-4">
          {stats.media === null && <p className="py-4 text-sm text-text-muted">Loading…</p>}
          {stats.media !== null && recentUploads.length === 0 && (
            <p className="py-4 text-sm text-text-muted">No uploads yet.</p>
          )}
          {recentUploads.length > 0 && (
            <>
              {/* thumbnail strip */}
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {recentUploads.map((f) => (
                  <Link key={f.id} href="/dashboard/media" className="block aspect-square overflow-hidden rounded-lg border border-border bg-section hover:opacity-80 transition-opacity">
                    {f.thumbnailUrl || f.originalUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={mediaUrl(f.thumbnailUrl ?? f.originalUrl)}
                        alt={f.altText}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">
                        <FileImage size={16} className="text-text-helper" />
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              {/* list */}
              <div className="flex flex-col gap-0.5">
                {recentUploads.slice(0, 3).map((f) => (
                  <Link key={f.id} href="/dashboard/media" className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-section">
                    <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-border bg-section">
                      {f.thumbnailUrl || f.originalUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={mediaUrl(f.thumbnailUrl ?? f.originalUrl)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">
                          <FileImage size={12} className="text-text-helper" />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold text-text">{f.fileName}</span>
                      <span className="block text-[10px] text-text-helper">{relativeTime(f.createdAt)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
