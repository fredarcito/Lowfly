"use client";

import { useState } from "react";
import KindChips from "@/components/search/results/KindChips";
import ResultList from "@/components/search/results/ResultList";
import ResultRow from "@/components/search/results/ResultRow";
import Section from "@/components/search/results/Section";
import { useI18n } from "@/context/i18n";
import { airlinesOf } from "@/utils/format";

// Most trips listed (the cheapest of the kinds shown)
const MAX_TRIPS = 10;
const KINDS = ["connection", "escapada"];

// The trips through a hub to the place searched (server/stopovers), cheapest first, with a filter by kind: all, the
// same-day connections or the getaways (nights in the hub's city). Each row opens its flights.
const StopoverResults = ({ trips, origin, place }) => {
  const { texts, format } = useI18n();
  const [kind, setKind] = useState("all");
  const kinds = KINDS.filter((candidate) => trips.some((trip) => trip.kind === candidate));
  const shown = trips.filter((trip) => kind === "all" || trip.kind === kind).slice(0, MAX_TRIPS);
  const options = [
    { value: "all", label: texts.results.stopoversAll },
    ...kinds.map((candidate) => ({ value: candidate, label: texts.results.tripKinds[candidate], hint: texts.results.tripKindHints[candidate] })),
  ];

  const titleOf = (trip) => {
    const last = trip.legs.at(-1);
    // The nights there and at the hub on the way: "2 noches en Roma + 4 en Tirana"
    const nights =
      trip.via.nights > 0 ? texts.results.hubAndStay(trip.via.nights, trip.via.city, trip.nights, trip.city) : texts.results.nightsIn(trip.nights, trip.city);
    return trip.nights != null
      ? `${format.fmtDay(trip.day)} → ${format.fmtDay(last.day)} · ${nights}`
      : `${format.fmtDay(trip.day)}${trip.via.nights > 0 ? ` · ${texts.results.nightsIn(trip.via.nights, trip.via.city)}` : ""}`;
  };
  const metaOf = (trip) =>
    // The nights are in the title; a same-day connection says its time
    [
      `${trip.city} (${trip.code})`,
      texts.results.via(trip.via.city),
      trip.via.nights === 0 && trip.via.minutes && texts.results.connectionIn(format.duration(trip.via.minutes), trip.via.city),
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <Section
      title={texts.results.stopovers}
      note={texts.results.stopoversNote(place)}
      action={kinds.length > 1 && <KindChips label={texts.results.stopovers} options={options} value={kind} onChange={setKind} />}
    >
      <ResultList>
        {shown.map((trip) => (
          <ResultRow
            key={`${trip.kind}-${trip.day}`}
            title={titleOf(trip)}
            meta={metaOf(trip)}
            airlines={airlinesOf(trip)}
            tag={{ label: texts.results.tripKinds[trip.kind], hint: texts.results.tripKindHints[trip.kind] }}
            priceNote={trip.nights != null ? texts.results.roundTrip : undefined}
            fare={trip}
            origin={origin}
          />
        ))}
      </ResultList>
    </Section>
  );
};

export default StopoverResults;
