// Photos of destinations (Wikipedia / Wikimedia Commons, through our API)
import { api } from "@/api/client";

// Photos of the cities served by these airports: { CTA: { src, page, author, license } | null }
export const getPhotos = (codes, options) =>
  api.get("/photos", { params: { codes: codes.join(",") }, ...options }).then((response) => response.data);

// A photo of any town, by its name and where it is (a trip planned by hand): { src, page, author, license } | null
export const getPlacePhoto = ({ city, lat, lng }, lang, options) =>
  api.get("/photos/place", { params: { city, lat, lng, lang }, ...options }).then((response) => response.data);
