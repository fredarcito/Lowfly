"use client";

import { Sparkles } from "lucide-react";
import { useAdmin } from "@/components/admin/hooks/useAdmin";

// What the AI cost to make a trip's itinerary: its tokens (in + out) and dollars, and, when it was made more than
// once, how many times and the total. `cost`: server/admin/users's { latest, generations, total }, or null for an
// itinerary made before the costs were kept per trip. The words wrap beside the icon, not under it.
const ItineraryCost = ({ cost }) => {
  const { texts, format } = useAdmin();
  return (
    <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
      <Sparkles className="mt-0.5 size-3.5 shrink-0" />
      {cost ? (
        <span className="tabular-nums">
          {texts.user.tokens(format.count(cost.latest.inputTokens), format.count(cost.latest.outputTokens))}
          {" · "}
          <span className="font-medium text-foreground">{format.money(cost.latest.cost)}</span>
          {cost.generations > 1 && ` ${texts.user.madeTimes(cost.generations, format.money(cost.total))}`}
        </span>
      ) : (
        <span>{texts.user.noCostData}</span>
      )}
    </p>
  );
};

export default ItineraryCost;
