"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Settings, Users } from "lucide-react";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// The admin's sections as tabs; the one open is marked (an account's page belongs to Users)
const AdminNav = () => {
  const { lang, texts } = useAdmin();
  const pathname = usePathname();
  const sections = [
    { href: ROUTES.admin(lang), label: texts.nav.dashboard, icon: BarChart3, active: pathname === ROUTES.admin(lang) },
    { href: ROUTES.adminUsers(lang), label: texts.nav.users, icon: Users, active: pathname.startsWith(ROUTES.adminUsers(lang)) },
    { href: ROUTES.adminSettings(lang), label: texts.nav.settings, icon: Settings, active: pathname.startsWith(ROUTES.adminSettings(lang)) },
  ];
  return (
    <nav aria-label={texts.nav.label} className="flex gap-1 overflow-x-auto rounded-xl bg-card p-1 ring-1 ring-foreground/10 sm:w-fit">
      {sections.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          aria-current={section.active ? "page" : undefined}
          className={cn(
            "flex h-9 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            section.active ? "bg-selected text-primary-ink" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <section.icon className="size-4" />
          {section.label}
        </Link>
      ))}
    </nav>
  );
};

export default AdminNav;
