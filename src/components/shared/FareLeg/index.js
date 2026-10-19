"use client";

import { PlaneLanding, PlaneTakeoff } from "lucide-react";
import FlightLeg from "@/components/shared/FlightLeg";
import { useFareEnds } from "@/components/shared/FareLeg/hooks/useFareEnds";
import { useI18n } from "@/context/i18n";

// One flight of a fare (`direction`: out | ret): day, departure → arrival, airline and, with `showPrice`, its price
const FareLeg = ({ fare, origin, direction = "out", showPrice = true }) => {
  const { texts } = useI18n();
  const { home, away } = useFareEnds(fare, origin);
  return direction === "ret" ? (
    <FlightLeg icon={PlaneLanding} label={texts.results.ret} flight={fare.ret} from={away} to={home} showPrice={showPrice} />
  ) : (
    <FlightLeg icon={PlaneTakeoff} label={texts.results.out} flight={fare.out || fare} from={home} to={away} showPrice={showPrice} />
  );
};

export default FareLeg;
