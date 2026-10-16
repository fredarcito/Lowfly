"use client";

import Link from "next/link";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { useAdminSections } from "@/components/admin/hooks/useAdminSections";
import { cn } from "@/utils/cn";

// The admin's sections as tabs, on phones and tablets (wider screens have the sidebar); the one open is marked
const AdminNav = ({ className }) => {
  const { texts } = useAdmin();
  const sections = useAdminSections();
  return (
    <nav aria-label={texts.nav.label} className={cn("flex gap-1 overflow-x-auto rounded-xl bg-card p-1 ring-1 ring-foreground/10 sm:w-fit", className)}>
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
