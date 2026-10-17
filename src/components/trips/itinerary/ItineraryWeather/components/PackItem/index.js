import { cn } from "@/utils/cn";

// After "Clothes:" the text goes on in lowercase ("Abrigo ligero" → "abrigo ligero"), except an acronym ("SPF 50")
const afterLabel = (text) => (/^\p{Lu}\p{Ll}/u.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text);

// One thing to pack for the weather, with its icon: "Clothes: a light jacket…"
const PackItem = ({ icon: Icon, label, text, className }) => (
  <p className={cn("flex items-start gap-3", className)}>
    <Icon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
    <span>
      {label}: {afterLabel(text)}
    </span>
  </p>
);

export default PackItem;
