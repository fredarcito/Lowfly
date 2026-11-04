---
paths: ["src/app/[lang]/login/**"]
---
# login

## Purpose
The sign-in page (Google or a link by email), for travellers who want their trips synced to an account.

## Map
- Public API: `src/app/[lang]/login/page.js`
- Files: 1. Most imported: `src/app/[lang]/login/page.js`
- Used by: nothing outside the module
- Depends on: src/components (2), src/constants (1), src/i18n (1), src/providers (1), src/utils (1)
- `page.js`: `LoginForm` (components/account) inside the `TripsPage` frame; `noindex` (`PRIVATE_PAGE`).

## How it works
The form signs in with Supabase in the browser (`supabase/signIn`). Both ways come back through
`/api/auth/callback`, which opens the session and goes on to `?next=` (or back here with `?error=`).

## Traps
- `<Suspense>` around the form is required: it reads `?next=` and `?error=` from the URL.
- `TripsPage` here is the shared page frame from `components/trips`, not the `/trips` page.
