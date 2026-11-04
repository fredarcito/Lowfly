---
paths: ["src/app/[lang]/admin/**"]
---
# admin

## Purpose
The admin's pages: overview stats, airline/search usage ("Uso"), accounts and app-wide settings. Only for admins.

## Map
- Public API: `src/app/[lang]/admin/layout.js`, `src/app/[lang]/admin/page.js`, `src/app/[lang]/admin/settings/page.js`, `src/app/[lang]/admin/usage/page.js`, `src/app/[lang]/admin/users/[id]/page.js`, `src/app/[lang]/admin/users/page.js`
- Files: 6. Most imported: `src/app/[lang]/admin/layout.js`, `src/app/[lang]/admin/page.js`, `src/app/[lang]/admin/settings/page.js`, `src/app/[lang]/admin/usage/page.js`, `src/app/[lang]/admin/users/[id]/page.js`, `src/app/[lang]/admin/users/page.js`
- Used by: nothing outside the module
- Depends on: src/server (11), src/components (6), src/constants (1), src/i18n (1), src/providers (1)
- `layout.js`: the admin check plus `AdminShell` (components/admin), `noindex`.
- `page.js` (overview), `usage/page.js`: read `?period=` and load stats from `server/admin/stats` and `server/admin/usage`.
- `users/page.js`: list with `?q= &filter= &sort= &dir= &page=` (`constants/adminUserList` reads them).
- `users/[id]/page.js`: one account; passes `self` so the admin can't delete, block or un-admin themselves.
- The logic lives outside this folder: `src/server/admin/*` (access, stats, usage, users, actions) and `src/components/admin/*`.

## How it works
Each page is a server component: check the visitor is an admin, read the query, load data from `server/admin`,
render a `components/admin` view. Changes (edit account, delete, limits) go through the server actions in
`server/admin/actions.js`, which check admin again.

## Decisions
- 2026-10-16: anyone who is not an admin gets "not found", as if the section didn't exist (layout.js comment).

## Traps
- Every page calls `isAdmin()`/`currentAdmin()` again even though the layout already did. Keep it: a layout's
  check doesn't protect a page's data loading on its own.
- Server actions can be called by anyone who finds them; each one in `server/admin/actions.js` must check admin first.
- `users/[id]` validates the id as a UUID before querying.
