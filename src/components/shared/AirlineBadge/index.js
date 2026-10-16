import { Badge } from "@/components/ui/badge";
import { AIRLINES } from "@/utils/format";
import { cn } from "@/utils/cn";

// Soft brand colours to see at a glance who you are flying with (the airlines from recent searches too)
const STYLES = {
  ryanair: "bg-[#073590]/10 text-[#073590] dark:bg-[#5b8cff]/15 dark:text-[#9bb8ff]",
  wizz: "bg-[#c6007e]/10 text-[#a10067] dark:bg-[#ff5cc2]/15 dark:text-[#ff9fdc]",
  easyjet: "bg-[#ff6600]/12 text-[#b84a00] dark:bg-[#ff8a3d]/15 dark:text-[#ffb27a]",
  vueling: "bg-[#ffcc00]/20 text-[#7a6100] dark:bg-[#ffd633]/15 dark:text-[#ffe066]",
  volotea: "bg-[#7a1f5c]/10 text-[#7a1f5c] dark:bg-[#d65fae]/15 dark:text-[#f0a3d3]",
  jet2: "bg-[#e3001b]/10 text-[#b30015] dark:bg-[#ff5c6c]/15 dark:text-[#ff9aa4]",
  transavia: "bg-[#00b373]/12 text-[#007a4f] dark:bg-[#33d69a]/15 dark:text-[#7fe8bf]",
  eurowings: "bg-[#a3006b]/10 text-[#8a005a] dark:bg-[#e05aa8]/15 dark:text-[#f29ccc]",
  norwegian: "bg-[#d81939]/10 text-[#b0142e] dark:bg-[#ff5c76]/15 dark:text-[#ff9aab]",
  pegasus: "bg-[#fdc300]/20 text-[#7a5d00] dark:bg-[#ffd23d]/15 dark:text-[#ffe27a]",
};

const AirlineBadge = ({ airline, className }) => {
  return (
    <Badge variant="secondary" className={cn(STYLES[airline], className)}>
      {AIRLINES[airline]}
    </Badge>
  );
};

export default AirlineBadge;
