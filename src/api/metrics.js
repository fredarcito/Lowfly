// What the admin's "Uso" page counts, told from the browser (app/api/metrics): never waited for, never in the way
import { api } from "@/api/client";

// A search that ended: its kind (`mode`), how ("results", "empty" or an error code) and whether its dates were changed
// from the form's
export const reportSearch = (report) => {
  api.post("/metrics/search", report).catch(() => {});
};
