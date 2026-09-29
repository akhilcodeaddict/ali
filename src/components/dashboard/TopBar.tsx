"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Menu,
  Search,
  Plus,
  Settings,
  ChevronDown,
  FileText,
  UploadCloud,
  UserPlus,
  LogOut,
  Bell,
  MessageSquare,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":              { title: "Dashboard",          subtitle: "Account overview" },
  "/dashboard/pages":        { title: "Pages",              subtitle: "Manage static site pages" },
  "/dashboard/hero":         { title: "Hero",               subtitle: "Homepage hero banner" },
  "/dashboard/banners":      { title: "Banners",            subtitle: "Slideshow banners" },
  "/dashboard/media":        { title: "Media",              subtitle: "Your uploaded images and files" },
  "/dashboard/products":     { title: "Products",           subtitle: "Manage services and products" },
  "/dashboard/testimonials": { title: "Testimonials",       subtitle: "Customer reviews and feedback" },
  "/dashboard/gallery":      { title: "Gallery",            subtitle: "Photo and video gallery" },
  "/dashboard/gallery-albums":{ title: "Gallery Albums",    subtitle: "Wedding portfolio albums" },
  "/dashboard/awards":       { title: "Awards",             subtitle: "Recognition and accolades" },
  "/dashboard/seo":          { title: "SEO",                subtitle: "Per-page search engine metadata" },
  "/dashboard/master":       { title: "Categories",         subtitle: "Master data categories" },
  "/dashboard/activity":     { title: "Activity",           subtitle: "Recent admin activity log" },
  "/dashboard/users":        { title: "Users",              subtitle: "Admin panel accounts" },
  "/dashboard/roles":        { title: "Roles",              subtitle: "Roles and permissions" },
  "/dashboard/contact":      { title: "Contact & Leads",    subtitle: "Contact form submissions" },
  "/dashboard/bookings":     { title: "Bookings",           subtitle: "Appointment requests" },
  "/dashboard/settings":     { title: "Settings",           subtitle: "Site-wide configuration" },
  "/dashboard/email-templates":{ title: "Email Notifications", subtitle: "Transactional email templates" },
  "/dashboard/email-logs":   { title: "Email Logs",         subtitle: "Sent email history" },
  "/dashboard/cache":        { title: "Cache Manager",      subtitle: "Clear cached content" },
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
  { href: "/dashboard/pages",  label: "New Page",       icon: FileText },
  { href: "/dashboard/media",  label: "Upload Media",   icon: UploadCloud },
  { href: "/dashboard/users",  label: "Add New User",   icon: UserPlus },
];

export function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const router = useRouter();
  const { email, name, logout } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const pageMeta = usePageMeta();

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

  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-border bg-surface px-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {/* Hamburger */}
      <button
        type="button"
        onClick={onToggleSidebar}
        title="Toggle sidebar"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-section hover:text-heading"
      >
        <Menu size={18} strokeWidth={1.75} />
      </button>

      {/* Page title */}
      <div className="hidden shrink-0 xl:block">
        <p className="text-[15px] font-semibold text-heading leading-tight">{pageMeta.title}</p>
        {pageMeta.subtitle && (
          <p className="text-[11px] text-text-helper leading-tight">{pageMeta.subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="relative ml-2 w-full max-w-[320px]">
        <Search size={14} strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-helper" />
        <input
          ref={searchRef}
          type="search"
          placeholder="Search..."
          className="h-9 w-full rounded-lg border border-border bg-section pl-9 pr-10 text-[13px] text-text placeholder:text-text-helper transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[9px] font-semibold text-text-helper">
          ⌘K
        </kbd>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1.5">

        {/* + Create */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setCreateOpen((v) => !v)}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-primary-dark cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.5} />
            Create
          </button>
          {createOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setCreateOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-52 rounded-lg border border-border bg-surface shadow-[var(--shadow-card-hover)] overflow-hidden">
                {createActions.map((a, idx) => (
                  <Link
                    key={a.label}
                    href={a.href}
                    onClick={() => setCreateOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-text hover:bg-section transition-colors ${idx !== createActions.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <a.icon size={14} strokeWidth={1.75} className="text-primary" />
                    {a.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <ThemeToggle />

        {/* Notifications */}
        <NotificationDropdown />

        {/* Settings shortcut */}
        <Link
          href="/dashboard/settings"
          title="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition hover:bg-section hover:text-heading"
        >
          <Settings size={17} strokeWidth={1.75} />
        </Link>

        {/* User menu */}
        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => setUserOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 transition hover:bg-section cursor-pointer"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
              {initials}
            </span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block max-w-[110px] truncate text-[12.5px] font-semibold text-heading">
                {name || "Admin"}
              </span>
            </span>
            <ChevronDown size={13} strokeWidth={2} className="text-text-helper" />
          </button>

          {userOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-lg border border-border bg-surface shadow-[var(--shadow-card-hover)]">
                <div className="border-b border-border px-4 py-3 bg-section">
                  <p className="truncate text-[13px] font-semibold text-heading">{name || "Admin"}</p>
                  <p className="truncate text-[11px] text-text-helper">{email}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-text hover:bg-section transition-colors"
                  >
                    <Settings size={14} strokeWidth={1.75} className="text-text-helper" />
                    Account Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => { logout(); router.replace("/login"); }}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-status-danger-text hover:bg-status-danger-bg transition-colors"
                  >
                    <LogOut size={14} strokeWidth={1.75} />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
