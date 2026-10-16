"use client";

import PhotoBackdrop from "@/components/shared/PhotoBackdrop";
import { tripPhotoKey, useTripPhoto } from "@/hooks/useTripPhoto";
import { fallbackPhoto } from "@/utils/fallbackPhoto";

// The trip's photo behind its header (shared/PhotoBackdrop). A trip planned by hand shows its first town; one
// without a photo, a generic travel photo. Nothing while it loads.
const TripBackdrop = ({ trip }) => {
  const photo = useTripPhoto(trip);
  if (photo === undefined) return null;
  return <PhotoBackdrop image={photo ?? fallbackPhoto(tripPhotoKey(trip))} photo={photo} />;
};

export default TripBackdrop;
