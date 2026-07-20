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
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-helper">
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
                    className="flex cursor-default items-center gap-2.5 rounded-sm px-3 py-[7px] text-sm font-medium text-text-helper/70"
                  >
                    <Icon size={16} strokeWidth={1.75} className="text-text-helper/60" />
                    <span className="flex-1">{item.label}</span>
                    <span className="rounded-full bg-status-neutral-bg px-1.5 py-px text-[10px] font-semibold text-text-helper">
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
                    "group flex items-center gap-2.5 rounded-sm px-3 py-[7px] text-sm font-medium transition-colors duration-100",
                    active
                      ? "bg-primary-light text-primary"
                      : "text-text-muted hover:bg-section hover:text-text"
                  )}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    className={clsx(
                      "transition-colors",
                      active ? "text-primary" : "text-text-helper group-hover:text-text-muted"
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
