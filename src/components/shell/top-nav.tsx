"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BarChart3, Box, GraduationCap, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/shell/locale-switcher";

interface NavItem {
  key: "decks" | "study" | "stats";
  href: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

const navItems: NavItem[] = [
  {
    key: "decks",
    href: "/",
    icon: Layers,
    isActive: (pathname) => pathname === "/",
  },
  {
    key: "study",
    href: "/study",
    icon: GraduationCap,
    isActive: (pathname) => pathname.startsWith("/study"),
  },
  {
    key: "stats",
    href: "/stats",
    icon: BarChart3,
    isActive: (pathname) => pathname.startsWith("/stats"),
  },
];

export function TopNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tApp = useTranslations("app");

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-copy-primary"
        >
          <Box className="h-5 w-5 text-brand" />
          <span>{tApp("name")}</span>
        </Link>

        <ul className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = item.isActive(pathname);
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-surface-raised text-copy-primary"
                      : "text-copy-muted hover:bg-surface-raised hover:text-copy-primary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t(item.key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center">
          <LocaleSwitcher />
        </div>
      </nav>
    </header>
  );
}
