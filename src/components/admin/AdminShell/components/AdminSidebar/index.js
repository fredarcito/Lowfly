"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminLogo from "@/components/admin/AdminShell/components/AdminLogo";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { useAdminSections } from "@/components/admin/hooks/useAdminSections";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// The admin's sidebar on wide screens: the logo, its sections (the open one marked) and, at the bottom, the way
// back to the app. It stays in place while the page scrolls.
const AdminSidebar = () => {
  const { lang, texts } = useAdmin();
  const sections = useAdminSections();
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r bg-card/40 px-4 pt-7 pb-5 lg:flex">
      <div className="px-2">
        <AdminLogo lang={lang} />
      </div>
      <nav aria-label={texts.nav.label} className="grid gap-1">
        <p className="px-3 pb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">{texts.nav.label}</p>
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            aria-current={section.active ? "page" : undefined}
            className={cn(
              "flex h-11 items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              section.active ? "bg-selected text-primary-ink" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <section.icon className="size-5" />
            {section.label}
          </Link>
        ))}
      </nav>
      <Link
        href={ROUTES.home(lang)}
        className="mt-auto flex items-center gap-2 border-t px-3 pt-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {texts.nav.back}
      </Link>
    </aside>
  );
};

export default AdminSidebar;
