"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, Luggage, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";

const CHIP = "grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-hero-glass ring-1 ring-hero-glass-edge backdrop-blur-md text-hero-foreground transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

// The visitor's account in the top bar: "Sign in" (back to this page afterwards), or their picture (or
// initial) with a menu: who they are, their trips, the admin (admins only: the server checks again there) and
// signing out. Nothing while the session loads.
export const AccountButton = () => {
  const { lang, texts } = useI18n();
  const { status, user, signOut } = useAuth();
  const pathname = usePathname();

  if (status === "loading") return <span aria-hidden className="size-9 shrink-0" />;

  if (status === "signedOut") {
    return (
      <Link
        href={ROUTES.login(lang, pathname)}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-hero-glass ring-1 ring-hero-glass-edge backdrop-blur-md px-3.5 text-sm font-bold text-hero-foreground transition-colors hover:bg-hero-glass/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none max-sm:w-9 max-sm:justify-center max-sm:px-0"
      >
        <LogIn className="size-4" />
        <span className="max-sm:sr-only">{texts.account.signIn}</span>
      </Link>
    );
  }

  // The picture Google gives; otherwise the first letter of the email
  const picture = user.user_metadata?.avatar_url;
  const name = user.user_metadata?.full_name ?? user.email;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={CHIP} aria-label={texts.account.menu(name)}>
        {picture ? (
          <img src={picture} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          <span className="font-heading text-sm font-bold uppercase">{user.email?.[0] ?? "?"}</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="grid gap-0.5 font-normal">
          {user.user_metadata?.full_name && <span className="font-medium">{user.user_metadata.full_name}</span>}
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.trips(lang)}>
            <Luggage /> {texts.trips.title}
          </Link>
        </DropdownMenuItem>
        {user.app_metadata?.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href={ROUTES.admin(lang)}>
              <ShieldCheck /> {texts.account.admin}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={signOut}>
          <LogOut /> {texts.account.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
