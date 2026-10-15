"use client";

import LegalLinks from "@/components/legal/LegalLinks";
import SearchModes from "@/components/search/SearchModes";
import TripsPromo from "@/components/search/TripsPromo";
import WeekendDeals from "@/components/search/WeekendDeals";
import { useI18n } from "@/context/i18n";

// Before searching: the trips promo, this weekend's cheapest trips (without them, what each search mode does)
// and the small print about prices
const SearchStart = ({ mode, origin, originName, onSeeAll }) => {
  const { texts } = useI18n();
  return (
    <>
      <TripsPromo />
      <WeekendDeals origin={origin} originName={originName} onSeeAll={onSeeAll} fallback={<SearchModes mode={mode} />} />
      <p className="-mt-4 text-xs text-muted-foreground">
        {texts.empty.disclaimer} <LegalLinks />
      </p>
    </>
  );
};

export default SearchStart;
