"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SideNav, NavSection } from "@/components/ui/SideNav";
import { TopBar } from "@/components/dashboard/TopBar";
import { LoadingBar } from "@/components/ui/LoadingBar";
import clsx from "clsx";
import { ToastProvider } from "@/lib/toast-context";
import Image from "next/image";
import {
  FileText,
  Quote,
  Image as ImageIcon,
  Images,
  ShieldCheck,
  UserCog,
  ScrollText,
  LayoutDashboard,
  Package,
  ListTodo,
  CheckSquare,
  CalendarClock,
  KeyRound,
  BarChart3,
  TrendingUp,
  Inbox,
  Settings,
  Database,
  HardDrive,
  Mail,
  ClipboardList,
  GalleryHorizontal,
  Search,
  Award,
  GalleryVerticalEnd,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, isLoading, can, name, email, roles } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading && !token) router.replace("/login");
  }, [isLoading, token, router]);

  if (isLoading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center text-text-muted">
        Loading…
      </div>
    );
  }

  const view = (module: string) => can(`${module}.view`);

  const rawSections: NavSection[] = [
    {
      items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true }],
    },
    {
      title: "Content",
      items: [
        ...(view("pages") ? [{ href: "/dashboard/pages", label: "Pages", icon: FileText }] : []),
        ...(view("hero") ? [{ href: "/dashboard/hero", label: "Hero", icon: ImageIcon }] : []),
        ...(view("banners") ? [{ href: "/dashboard/banners", label: "Banners", icon: GalleryVerticalEnd }] : []),
        ...(view("media") ? [{ href: "/dashboard/media", label: "Media", icon: Images }] : []),
        ...(view("products") ? [{ href: "/dashboard/products", label: "Products", icon: Package }] : []),
        ...(view("testimonials")
          ? [{ href: "/dashboard/testimonials", label: "Testimonials", icon: Quote }]
          : []),
        ...(view("gallery") ? [{ href: "/dashboard/gallery", label: "Gallery", icon: GalleryHorizontal }] : []),
        ...(view("gallery-albums")
          ? [{ href: "/dashboard/gallery-albums", label: "Gallery Albums", icon: Images }]
          : []),
        ...(view("awards") ? [{ href: "/dashboard/awards", label: "Awards", icon: Award }] : []),
        ...(can("seo.view") ? [{ href: "/dashboard/seo", label: "SEO", icon: Search }] : []),
      ],
    },
    {
      title: "Master Data",
      items: [
        ...(can("categories.view") ? [{ href: "/dashboard/master", label: "Categories", icon: Database }] : []),
      ],
    },
    {
      title: "Workspace",
      items: [
        { href: "#", label: "Tasks", icon: ListTodo, soon: true },
        { href: "#", label: "Approvals", icon: CheckSquare, soon: true },
        { href: "#", label: "Scheduled Posts", icon: CalendarClock, soon: true },
        ...(can("audit.view")
          ? [{ href: "/dashboard/activity", label: "Activity", icon: ScrollText }]
          : []),
      ],
    },
    {
      title: "Team",
      items: [
        ...(view("users") ? [{ href: "/dashboard/users", label: "Users", icon: UserCog }] : []),
        ...(view("roles") ? [{ href: "/dashboard/roles", label: "Roles", icon: ShieldCheck }] : []),
        { href: "#", label: "Permissions", icon: KeyRound, soon: true },
      ],
    },
    {
      title: "Reports",
      items: [
        { href: "#", label: "Analytics", icon: BarChart3, soon: true },
        { href: "#", label: "Traffic", icon: TrendingUp, soon: true },
        ...(view("contact") ? [{ href: "/dashboard/contact", label: "Contact & Leads", icon: Inbox }] : []),
        ...(view("contact") ? [{ href: "/dashboard/bookings", label: "Bookings", icon: CalendarClock }] : []),
      ],
    },
    {
      title: "System",
      items: [
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
        ...(can("settings.view") ? [
          { href: "/dashboard/email-templates", label: "Email Notifications", icon: Mail },
          { href: "/dashboard/email-logs", label: "Email Logs", icon: ClipboardList },
          { href: "/dashboard/cache", label: "Cache Manager", icon: HardDrive },
        ] : []),
        { href: "#", label: "Logs", icon: ScrollText, soon: true },
      ],
    },
  ];

  const sections = rawSections
    .map((s) => ({ ...s, items: s.items.filter((i) => !(i as any).soon) }))
    .filter((s) => s.items.length > 0);

  const initials = (name || email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const roleLabel = roles[0] ?? "Administrator";

  return (
    <ToastProvider>
    <LoadingBar />
    <div className="min-h-screen bg-section">

      {/* ── Sidebar ── */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-[230px] flex-col border-r border-border bg-surface shadow-[1px_0_0_0_var(--color-border)] transition-transform duration-200",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Image src="/ali-logo.png" alt="ALI" width={22} height={28} className="h-6 w-auto object-contain brightness-0 invert" priority />
          </div>
          <div className="leading-none">
            <p className="text-[15px] font-bold text-heading" style={{ fontFamily: "var(--font-arimo)", letterSpacing: "0.03em" }}>ALI</p>
            <p className="text-[10px] font-medium text-text-helper" style={{ fontFamily: "var(--font-arimo)", letterSpacing: "0.18em", marginTop: 1 }}>CMS Studio</p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <SideNav sections={sections} />
        </div>

        {/* User footer */}
        <div className="flex shrink-0 items-center gap-2.5 border-t border-border bg-section px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold text-heading">{name || "Admin"}</p>
            <p className="truncate text-[11px] text-text-helper">{roleLabel}</p>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div
        className={clsx(
          "flex min-h-screen flex-col transition-[margin] duration-200",
          sidebarOpen ? "ml-[230px]" : "ml-0"
        )}
      >
        <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1">
          <div className="mx-auto max-w-[1560px] px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
