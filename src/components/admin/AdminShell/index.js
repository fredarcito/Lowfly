import { AccountButton } from "@/components/layout/AccountButton";
import LanguageSwitch from "@/components/layout/LanguageSwitch";
import SettingsMenu from "@/components/layout/SettingsMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";
import AdminNav from "@/components/admin/AdminNav";
import AdminLogo from "@/components/admin/AdminShell/components/AdminLogo";
import AdminSidebar from "@/components/admin/AdminShell/components/AdminSidebar";

// The admin's own frame, apart from the app's: a sidebar with its sections on wide screens (the logo and tabs on
// top on phones and tablets), the theme, language and account on the top right, and the page. One column as wide
// as the page: a row of tabs or a table scrolls inside it instead of widening it.
const AdminShell = ({ lang, children }) => (
  <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
    <AdminSidebar />
    <div className="min-w-0">
      <header className="flex items-center justify-between gap-3 px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-4 text-hero-foreground sm:px-6 lg:px-10 lg:pt-6">
        <span className="lg:hidden">
          <AdminLogo lang={lang} />
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <SettingsMenu className="md:hidden" />
          <ThemeToggle className="max-md:hidden" />
          <LanguageSwitch className="max-md:hidden" />
          <AccountButton />
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] sm:px-6 lg:px-10">
        <AdminNav className="lg:hidden" />
        {children}
      </main>
    </div>
  </div>
);

export default AdminShell;
