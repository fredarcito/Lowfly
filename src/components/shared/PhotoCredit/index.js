import { Copyright } from "lucide-react";
import { cn } from "@/utils/cn";

// The © over a photo that credits it (its licence requires it): a small round link to its page, its author
// and licence in the tooltip and for screen readers. `className` places it.
const PhotoCredit = ({ page, text, className }) => (
  <a
    href={page}
    target="_blank"
    rel="noopener noreferrer"
    title={text}
    aria-label={text}
    className={cn(
      "absolute z-10 grid size-6 place-items-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm hover:bg-black/60 hover:text-white",
      className
    )}
  >
    <Copyright className="size-3.5" />
  </a>
);

export default PhotoCredit;
