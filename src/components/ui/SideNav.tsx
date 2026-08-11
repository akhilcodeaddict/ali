"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Only highlight on exact path match (for index routes like /dashboard) */
  exact?: boolean;
  /** Module not built yet — rendered as a disabled row with a "Soon" chip */
  soon?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export function SideNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5">
      {sections.map((section, i) => (
        <div key={section.title ?? i}>
          {section.title && (
            <p className="mb-2 px-3.5 text-[11px] font-bold uppercase tracking-wider text-white/35">
              {section.title}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;

              if (item.soon) {
                return (
                  <span
                    key={item.label}
                    title="Coming soon"
                    className="flex cursor-default items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-white/30"
                  >
                    <Icon size={18} strokeWidth={1.75} className="text-white/25" />
                    <span className="flex-1">{item.label}</span>
                    <span className="rounded-full bg-white/10 px-1.5 py-px text-[10px] font-semibold text-white/40">
                      Soon
                    </span>
                  </span>
                );
              }

              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "group flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors duration-100",
                    active
                      ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_4px_14px_-2px_rgba(124,58,237,0.55)]"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.75}
                    className={clsx(
                      "transition-colors",
                      active ? "text-white" : "text-white/40 group-hover:text-white/70"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
