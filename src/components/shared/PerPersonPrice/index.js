"use client";

import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// "29,98 € por persona" under a price that is the total of several adults; nothing when the search is for one
const PerPersonPrice = ({ price, cur, className }) => {
  const { format } = useI18n();
  if (format.passengers < 2) return null;
  return <p className={cn("text-muted-foreground tabular-nums", className)}>{format.perPerson(price, cur)}</p>;
};

export default PerPersonPrice;
