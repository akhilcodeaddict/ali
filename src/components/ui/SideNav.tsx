"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  soon?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export function SideNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {sections.map((section, i) => (
        <div key={section.title ?? i} className="mb-1">
          {section.title && (
            <p className="mb-1 px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-helper">
              {section.title}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;

              if (item.soon) return null;

              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "group flex items-center gap-2.5 rounded-[6px] px-3 py-2 text-[13.5px] font-medium transition-all duration-150",
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-muted hover:bg-primary-light hover:text-primary"
                  )}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    className={clsx(
                      "shrink-0 transition-colors",
                      active ? "text-white" : "text-text-helper group-hover:text-primary"
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
