"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/utils/analytics";

// A route page's way into the "Recorridos" search (the search as usual, not only this route), counted in Google
// Analytics by route and where it was tapped (`spot`: hero, card): how many readers go on to search
const RouteSearchLink = ({ href, route, spot, className, children }) => (
  <Button asChild className={className}>
    <Link href={href} onClick={() => track("route_page_search_click", { route, spot })}>
      {children} <ArrowRight />
    </Link>
  </Button>
);

export default RouteSearchLink;
