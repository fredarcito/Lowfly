"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/utils/analytics";

// A guide's way into the planner, counted in Google Analytics by where it was tapped (`spot`: hero, afterFirstDay,
// afterSecondDay, afterLastDay, card): how many readers go on to make their own, and which prompt brings them
const TailorLink = ({ href, guide, spot, variant = "default", className, children }) => (
  <Button asChild variant={variant} className={className}>
    <Link href={href} onClick={() => track("guide_tailor_click", { guide, spot })}>
      {children} <ArrowRight />
    </Link>
  </Button>
);

export default TailorLink;
