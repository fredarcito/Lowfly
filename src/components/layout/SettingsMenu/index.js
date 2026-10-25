"use client";

import { Check, Download, Moon, Settings2, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InstallSteps from "@/components/shared/InstallSteps";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useInstallApp } from "@/hooks/useInstallApp";
import { useLanguagePaths } from "@/hooks/useLanguagePaths";
import { useTheme } from "@/hooks/useTheme";
import { LOCALES } from "@/i18n/config";
import { cn } from "@/utils/cn";

const THEME_ICONS = { light: Sun, dark: Moon };

// Phones and small tablets: the theme and the language in one round "Settings" button with a menu, so the top bar
// has room for the navigation's names. Bigger screens show them side by side (ThemeToggle, LanguageSwitch).
// On top, installing Lowfly on the home screen, while this browser can (the home's banner offers it once).
const SettingsMenu = ({ className }) => {
  const { lang, texts } = useI18n();
  const { theme, setTheme } = useTheme();
  const pathIn = useLanguagePaths();
  const { way, install } = useInstallApp();
  const steps = useDisclosure();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={texts.header.settings}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full bg-hero-glass text-hero-foreground/85 ring-1 ring-hero-glass-edge backdrop-blur-md transition-colors hover:text-hero-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            className
          )}
        >
          <Settings2 className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          {way && (
            <>
              <DropdownMenuItem onSelect={way === "prompt" ? install : steps.show}>
                <Download /> {texts.install.menu}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuLabel className="text-xs text-muted-foreground">{texts.header.theme}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            {Object.entries(THEME_ICONS).map(([themeName, Icon]) => (
              <DropdownMenuRadioItem key={themeName} value={themeName}>
                <Icon /> {texts.header.themes[themeName]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">{texts.header.language}</DropdownMenuLabel>
          {/* Plain links (full reload), as in LanguageSwitch */}
          {LOCALES.map((locale) => (
            <DropdownMenuItem key={locale} asChild>
              <a
                href={pathIn(locale)}
                hrefLang={locale}
                lang={locale}
                aria-current={locale === lang ? "page" : undefined}
              >
                <span className="flex-1">{texts.header.languageNames[locale]}</span>
                {locale === lang && <Check className="text-primary" />}
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <InstallSteps open={steps.open} onOpenChange={steps.setOpen} />
    </>
  );
};

export default SettingsMenu;
