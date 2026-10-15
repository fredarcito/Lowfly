import Link from "next/link";
import { cn } from "@/utils/cn";

// A link in the header navigation, underlined when it is the current page
const NavLink = ({ href, active, className, children, ...props }) => {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-2 rounded-md py-1.5 font-heading text-[0.95rem] font-semibold max-[340px]:text-sm whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        "after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-primary after:transition-opacity",
        active ? "text-hero-foreground after:opacity-100" : "text-hero-muted after:opacity-0 hover:text-hero-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export default NavLink;
