"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import clsx from "clsx";
import {
  Menu,
  Search,
  Plus,
  Settings,
  ChevronDown,
  FileText,
  Newspaper,
  UploadCloud,
  UserPlus,
  LogOut,
  Inbox,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your site's content and activity" },
  "/dashboard/pages": { title: "Pages", subtitle: "Manage static site pages" },
  "/dashboard/blog": { title: "Blog", subtitle: "Write and publish articles" },
  "/dashboard/news": { title: "News", subtitle: "Manage news announcements" },
  "/dashboard/hero": { title: "Hero", subtitle: "Homepage hero banner" },
  "/dashboard/media": { title: "Media", subtitle: "Your uploaded images and files" },
  "/dashboard/documents": { title: "Documents", subtitle: "Downloadable documents" },
  "/dashboard/products": { title: "Products", subtitle: "Manage services and products" },
  "/dashboard/branches": { title: "Branches", subtitle: "Manage business locations" },
  "/dashboard/testimonials": { title: "Testimonials", subtitle: "Customer reviews and feedback" },
  "/dashboard/team": { title: "Team", subtitle: "Staff profiles" },
  "/dashboard/clients": { title: "Clients", subtitle: "Client and brand logos" },
  "/dashboard/careers": { title: "Careers", subtitle: "Job openings" },
  "/dashboard/faqs": { title: "FAQs", subtitle: "Frequently asked questions" },
  "/dashboard/gallery": { title: "Gallery", subtitle: "Photo and video gallery" },
  "/dashboard/seo": { title: "SEO", subtitle: "Per-page search engine metadata" },
  "/dashboard/master": { title: "Categories", subtitle: "Master data categories" },
  "/dashboard/menu": { title: "Menu Manager", subtitle: "Site navigation menu" },
  "/dashboard/footer": { title: "Footer Manager", subtitle: "Site footer content" },
  "/dashboard/activity": { title: "Activity", subtitle: "Recent admin activity log" },
  "/dashboard/users": { title: "Users", subtitle: "Admin panel accounts" },
  "/dashboard/roles": { title: "Roles", subtitle: "Roles and permissions" },
  "/dashboard/contact": { title: "Leads", subtitle: "Contact form submissions" },
  "/dashboard/bookings": { title: "Bookings", subtitle: "Appointment requests" },
  "/dashboard/settings": { title: "Settings", subtitle: "Site-wide configuration" },
  "/dashboard/email-templates": { title: "Email Notifications", subtitle: "Transactional email templates" },
  "/dashboard/email-logs": { title: "Email Logs", subtitle: "Sent email history" },
  "/dashboard/cache": { title: "Cache Manager", subtitle: "Clear cached content" },
};

function usePageMeta() {
  const pathname = usePathname();
  if (!pathname) return PAGE_META["/dashboard"];
  const match = Object.keys(PAGE_META)
    .filter((p) => pathname === p || pathname.startsWith(`${p}/`))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_META[match] : { title: "Dashboard", subtitle: "" };
}

const createActions = [
  { href: "/dashboard/pages", label: "New Page", icon: FileText },
  { href: "/dashboard/blog/new", label: "Create Blog Post", icon: Newspaper },
  { href: "/dashboard/media", label: "Upload Media", icon: UploadCloud },
  { href: "/dashboard/users", label: "Add New User", icon: UserPlus },
];

function IconButton({
  title,
  children,
  badge,
  onClick,
  href,
}: {
  title: string;
  children: React.ReactNode;
  badge?: number;
  onClick?: () => void;
  href?: string;
}) {
  const cls =
    "relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-section text-text-muted transition-colors hover:text-primary cursor-pointer";

  const inner = (
    <>
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-danger-text px-1 text-[10px] font-bold leading-none text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} title={title} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" title={title} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const router = useRouter();
  const { email, name, logout } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const initials = (name || email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const pageMeta = usePageMeta();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface px-5">
      <button
        type="button"
        onClick={onToggleSidebar}
        title="Toggle sidebar"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-section hover:text-text cursor-pointer"
      >
        <Menu size={18} strokeWidth={1.75} />
      </button>

      <div className="hidden shrink-0 xl:block">
        <h1 className="mb-0.5 text-lg font-bold text-heading">{pageMeta.title}</h1>
        {pageMeta.subtitle && <p className="text-xs font-medium text-text-helper">{pageMeta.subtitle}</p>}
      </div>

      <div className="relative w-full max-w-[440px]">
        <Search
          size={15}
          strokeWidth={1.75}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-helper"
        />
        <input
          ref={searchRef}
          type="search"
          placeholder="Search anything..."
          className="h-10 w-full rounded-full border border-border bg-section pl-10 pr-14 text-sm text-text placeholder:text-text-helper transition-shadow focus:border-primary focus:bg-surface focus:outline-none focus:shadow-[var(--shadow-focus)]"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-surface px-1.5 py-0.5 text-[11px] font-medium text-text-helper">
          ⌘ K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setCreateOpen((v) => !v)}
            className="flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 px-4 text-sm font-semibold text-white shadow-[0_8px_18px_-6px_rgba(124,58,237,0.6)] transition-all hover:brightness-105 cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.25} />
            Create
            <ChevronDown size={14} strokeWidth={2} className={clsx("transition-transform", createOpen && "rotate-180")} />
          </button>
          {createOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setCreateOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-52 rounded-lg border border-border bg-surface p-1.5 shadow-[var(--shadow-card-hover)]">
                {createActions.map((a) => (
                  <Link
                    key={a.label}
                    href={a.href}
                    onClick={() => setCreateOpen(false)}
                    className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm font-medium text-text hover:bg-section"
                  >
                    <a.icon size={15} strokeWidth={1.75} className="text-text-helper" />
                    {a.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <ThemeToggle />

        <NotificationDropdown />

        {/* Leads / contact messages inbox */}
        <IconButton title="Contact Messages" href="/dashboard/contact">
          <Inbox size={17} strokeWidth={1.75} />
        </IconButton>

        {/* Settings shortcut */}
        <IconButton title="Settings" href="/dashboard/settings">
          <Settings size={17} strokeWidth={1.75} />
        </IconButton>

        <div className="relative ml-1.5">
          <button
            type="button"
            onClick={() => setUserOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-section cursor-pointer"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
              {initials}
            </span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block max-w-[140px] truncate text-[13px] font-semibold text-text">
                {name || "Admin"}
              </span>
              <span className="block text-[11px] text-text-helper">Administrator</span>
            </span>
            <ChevronDown size={14} strokeWidth={2} className="text-text-helper" />
          </button>
          {userOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-border bg-surface p-1.5 shadow-[var(--shadow-card-hover)]">
                <div className="border-b border-border px-2.5 py-2">
                  <p className="truncate text-[13px] font-semibold text-text">{name || "Admin"}</p>
                  <p className="truncate text-[11px] text-text-helper">{email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.replace("/login");
                  }}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm font-medium text-text hover:bg-section cursor-pointer"
                >
                  <LogOut size={15} strokeWidth={1.75} className="text-text-helper" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
