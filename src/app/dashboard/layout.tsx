"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SideNav, NavSection } from "@/components/ui/SideNav";
import { TopBar } from "@/components/dashboard/TopBar";
import clsx from "clsx";
import { ToastProvider } from "@/lib/toast-context";
import Image from "next/image";
import {
  FileText,
  Newspaper,
  Users,
  Building2,
  Quote,
  Briefcase,
  Image as ImageIcon,
  Images,
  ShieldCheck,
  UserCog,
  ScrollText,
  LayoutDashboard,
  Megaphone,
  FileStack,
  Package,
  MapPin,
  ListTodo,
  CheckSquare,
  CalendarClock,
  KeyRound,
  BarChart3,
  TrendingUp,
  Inbox,
  Settings,
  Database,
  HelpCircle,
  Navigation,
  LayoutTemplate,
  HardDrive,
  Mail,
  ClipboardList,
  GalleryHorizontal,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, isLoading, can } = useAuth();
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
        ...(view("blog") ? [{ href: "/dashboard/blog", label: "Blog", icon: Newspaper }] : []),
        ...(view("news") ? [{ href: "/dashboard/news", label: "News", icon: Megaphone }] : []),
        ...(view("hero") ? [{ href: "/dashboard/hero", label: "Hero", icon: ImageIcon }] : []),
        ...(view("media") ? [{ href: "/dashboard/media", label: "Media", icon: Images }] : []),
        ...(view("documents") ? [{ href: "/dashboard/documents", label: "Documents", icon: FileStack }] : []),
        ...(view("products") ? [{ href: "/dashboard/products", label: "Products", icon: Package }] : []),
        ...(view("branches") ? [{ href: "/dashboard/branches", label: "Branches", icon: MapPin }] : []),
        ...(view("testimonials")
          ? [{ href: "/dashboard/testimonials", label: "Testimonials", icon: Quote }]
          : []),
        ...(view("team") ? [{ href: "/dashboard/team", label: "Team", icon: Users }] : []),
        ...(view("clients") ? [{ href: "/dashboard/clients", label: "Clients", icon: Building2 }] : []),
        ...(view("careers") ? [{ href: "/dashboard/careers", label: "Careers", icon: Briefcase }] : []),
        ...(view("faqs") ? [{ href: "/dashboard/faqs", label: "FAQs", icon: HelpCircle }] : []),
        ...(view("gallery") ? [{ href: "/dashboard/gallery", label: "Gallery", icon: GalleryHorizontal }] : []),
      ],
    },
    {
      title: "Master Data",
      items: [
        ...(can("categories.view") ? [{ href: "/dashboard/master", label: "Categories", icon: Database }] : []),
        ...(can("menu.view") ? [{ href: "/dashboard/menu", label: "Menu Manager", icon: Navigation }] : []),
        ...(can("footer.view") ? [{ href: "/dashboard/footer", label: "Footer Manager", icon: LayoutTemplate }] : []),
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
        ...(view("contact") ? [{ href: "/dashboard/contact", label: "Leads", icon: Inbox }] : []),
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

  const sections = rawSections.filter((s) => s.items.length > 0);

  return (
    <ToastProvider>
    <div className="min-h-screen bg-section">
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-border bg-white transition-transform duration-200",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <Image src="/logo.png" alt="Jalasthali" width={40} height={40} priority />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-heading">Jalasthali</p>
            <p className="text-[11px] font-medium text-text-helper">CMS Website Builder</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SideNav sections={sections} />
        </div>
      </aside>

      <div
        className={clsx(
          "flex min-h-screen flex-col transition-[margin] duration-200",
          sidebarOpen ? "ml-[240px]" : "ml-0"
        )}
      >
        <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1">
          <div className="mx-auto max-w-[1560px] px-6 py-7">{children}</div>
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
