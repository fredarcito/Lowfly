import { Badge } from "@/components/ui/badge";
import { AIRLINES } from "@/utils/format";
import { cn } from "@/utils/cn";

// Soft brand colours to see at a glance who you are flying with
const STYLES = {
  ryanair: "bg-[#073590]/10 text-[#073590] dark:bg-[#5b8cff]/15 dark:text-[#9bb8ff]",
  wizz: "bg-[#c6007e]/10 text-[#a10067] dark:bg-[#ff5cc2]/15 dark:text-[#ff9fdc]",
};

const AirlineBadge = ({ airline, className }) => {
  return (
    <Badge variant="secondary" className={cn(STYLES[airline], className)}>
      {AIRLINES[airline]}
    </Badge>
  );
};

export default AirlineBadge;
