// Why each destination is worth a visit (written once from Wikipedia and Wikivoyage, through our API)
import { api } from "@/api/client";

// { BRI: { text, tags, source } | null }
export const getGuides = (codes, lang, options) =>
  api.get("/guides", { params: { codes: codes.join(","), lang }, ...options }).then((response) => response.data);
