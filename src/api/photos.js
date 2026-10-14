// Photos of destinations (Wikipedia / Wikimedia Commons, through our API)
import { api } from "@/api/client";

// Photos of the cities served by these airports: { CTA: { src, page, author, license } | null }
export const getPhotos = (codes, options) =>
  api.get("/photos", { params: { codes: codes.join(",") }, ...options }).then((response) => response.data);
