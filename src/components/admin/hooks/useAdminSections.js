"use client";

import { usePathname } from "next/navigation";
import { BarChart3, Settings, Users } from "lucide-react";
import { useAdmin } from "@/components/admin/hooks/useAdmin";
import { ROUTES } from "@/constants/routes";

// The admin's sections, for the sidebar (desktop) and the tabs (phones): [{ href, label, icon, active }]. An
// account's page belongs to Users; the period chosen in the overview stays when coming back to it.
export const useAdminSections = () => {
  const { lang, texts } = useAdmin();
  const pathname = usePathname();
  return [
    { href: ROUTES.admin(lang), label: texts.nav.dashboard, icon: BarChart3, active: pathname === ROUTES.admin(lang) },
    { href: ROUTES.adminUsers(lang), label: texts.nav.users, icon: Users, active: pathname.startsWith(ROUTES.adminUsers(lang)) },
    { href: ROUTES.adminSettings(lang), label: texts.nav.settings, icon: Settings, active: pathname.startsWith(ROUTES.adminSettings(lang)) },
  ];
};
