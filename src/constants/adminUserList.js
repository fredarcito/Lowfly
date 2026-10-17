import { ROUTES } from "@/constants/routes";

// The admin's account list (/es/admin/users): what it can be sorted and filtered by, and how many go on a page.
// Everything is in the address (?q=&filter=&sort=&dir=&page=), so a view can be reloaded or shared.

export const USERS_PER_PAGE = 20;

// Each sort: the account's figure it uses, and the direction it starts in (biggest or newest first; names A–Z)
export const SORTS = {
  joined: { field: "createdAt", start: "desc" },
  lastSeen: { field: "lastSignInAt", start: "desc" },
  name: { field: "name", start: "asc" },
  tripsActive: { field: "trips", start: "desc" },
  tripsTotal: { field: "tripsSaved", start: "desc" },
  itinerariesActive: { field: "itinerariesActive", start: "desc" },
  itinerariesTotal: { field: "itineraries", start: "desc" },
  cost: { field: "cost", start: "desc" },
};

// Each filter: which accounts it keeps
export const FILTERS = {
  all: () => true,
  admins: (user) => user.admin,
  blocked: (user) => user.blocked,
  google: (user) => user.google,
  email: (user) => !user.google,
  withItineraries: (user) => user.itineraries > 0,
  inactive: (user) => user.tripsSaved === 0 && user.itineraries === 0,
};

const DEFAULTS = { q: "", filter: "all", sort: "joined", dir: "desc", page: 1 };

// The list's view from the address' parameters, anything unknown left at its default:
// { q, filter, sort, dir, page }
export const readUserListParams = (params = {}) => {
  const sort = SORTS[params.sort] ? params.sort : DEFAULTS.sort;
  return {
    q: String(params.q ?? "").slice(0, 100),
    filter: FILTERS[params.filter] ? params.filter : DEFAULTS.filter,
    sort,
    dir: params.dir === "asc" || params.dir === "desc" ? params.dir : SORTS[sort].start,
    page: Math.max(1, Number.parseInt(params.page, 10) || 1),
  };
};

// The list's address for a view (`view`: as readUserListParams gives it, changed), defaults left out
export const userListHref = (lang, view) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(view)) {
    const isDefault = key === "dir" ? value === SORTS[view.sort ?? DEFAULTS.sort].start : value === DEFAULTS[key];
    if (value !== undefined && value !== "" && !isDefault) params.set(key, String(value));
  }
  const search = params.toString();
  return `${ROUTES.adminUsers(lang)}${search ? `?${search}` : ""}`;
};
