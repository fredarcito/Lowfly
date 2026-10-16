import Link from "next/link";
import { Plane } from "lucide-react";
import { APP_NAME } from "@/i18n/config";
import { ROUTES } from "@/constants/routes";

// Lowfly's logo and name, as in the app's top bar, opening the admin's overview
const AdminLogo = ({ lang }) => (
  <Link href={ROUTES.admin(lang)} className="flex w-fit items-center gap-2 font-heading text-xl font-extrabold tracking-tight">
    <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
      <Plane className="size-4 -rotate-45" />
    </span>
    {APP_NAME}
  </Link>
);

export default AdminLogo;
