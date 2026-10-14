// The HTTP client every service uses to call our own API (app/api/*) from the browser.
// axios builds the query, parses the JSON and throws on 4xx/5xx. Pass { signal } from an
// AbortController to cancel a call. One file per service sits next to this one (airports, flights…).
// (Server-side calls to the airlines and Wikipedia keep using fetch: Next.js only caches fetch.)
import axios from "axios";

export const api = axios.create({ baseURL: "/api", timeout: 60_000 });

// Our API answers errors with { error, params }: the code to translate (lib/i18n) and its values.
// Without an answer, or on a server error, retrying later may help.
export function apiError(error) {
  const { response } = error;
  return {
    code: response?.data?.error || "unknown",
    params: response?.data?.params,
    retry: !response || response.status >= 500,
  };
}

// The call was cancelled (component unmounted, a newer search started): not an error to show
export const isCancelled = (error) => axios.isCancel(error);
