# Lowfly in the App Store: a Capacitor shell around the web

Status (proposed 2026-10-31): **design only, nothing built**. Build it only after an explicit "implementa".

## Why this way

The app is the website inside a native shell (Capacitor). The shell loads `https://lowfly.travel` itself, not a copy
of it, so:

- No new API: BotID, the Supabase session cookies and every `/api/*` route keep working as they do in Safari.
- One codebase: a deploy on Vercel updates the app too, with no new review (only the shell's native parts need one).
- What makes it pass Apple's review (guideline 4.2, "minimum functionality") is a handful of native pieces on top:
  trips offline, trip reminders, the native share sheet and calendar, bookings in the system browser.

A React Native app with its own API (App Attest instead of BotID, Bearer tokens, a versioned `/api/v1`) is the
alternative if the app ever outgrows this. Not now.

## Where it lives

All in this repository. The web does not change size or speed:

```
capacitor.config.json    ← the shell: app id, the URL it loads, the offline page, plugins
ios/                     ← the Xcode project Capacitor generates (committed; built on a Mac, never on Vercel)
mobile/offline/          ← the page bundled in the app, shown when lowfly.travel cannot load
src/native/              ← the web's side of the native pieces (see "Native code in the web")
```

- `next build` and Vercel ignore `ios/` and `mobile/`; the deploy does not change.
- Capacitor's packages (`@capacitor/core`, `@capacitor/ios`, the plugins) are dependencies, but the web only loads
  them in the app: every native call is a dynamic `import()` behind `isNativeApp()`. A visitor in a browser downloads
  none of it.
- Android later is one more folder (`android/`) with the same web and the same plugins.

## Native code in the web

`src/native/index.js`: `isNativeApp()` (`window.Capacitor?.isNativePlatform()`, false on the server and in browsers),
and one small module per piece (`share.js`, `calendar.js`, `reminders.js`, `browser.js`, `offlineTrips.js`), each
importing its plugin only when called. Components call `src/native/…`, never a plugin directly, and keep their web
behaviour when not in the app:

```js
// src/native/share.js
export const shareNatively = async ({ title, url }) => {
  const { Share } = await import("@capacitor/share");
  await Share.share({ title, url });
};
```

`useShareLink` then does: in the app → `shareNatively`; in a browser → what it does today.

## Scope of the first version

### Required by Apple (rejected without them)

1. **Delete your account, from the account menu.** Guideline 5.1.1(v). Today only the admin can
   (`components/admin/UserDetail/components/DeleteAccount`, `server/admin/actions.js`). A "Borrar cuenta" in the
   account menu with a confirmation, calling a server action that deletes the signed-in user only (the same deletion
   as the admin's: trips, shares, usage rows, then the auth user). The web gets it too: it is good practice anyway.
2. **Sign in with Apple**, because Google sign-in is offered (guideline 4.8). Supabase supports it (provider "apple").
   On the web: a button next to Google's. In the app: see "Sign-in inside the app" below.
3. **No blank screen offline.** Capacitor's `server.errorPath` shows `mobile/offline/index.html` when the site cannot
   load: the logo, "Sin conexión", a retry button, and the saved trips (item 4).

### What makes it an app

4. **Trips offline.** The trips already live on the device (localStorage, `store/trips.js`), but that storage
   belongs to the site and the offline page cannot read it. So, in the app, every change of the trips is also written
   to the app's own storage (`@capacitor/preferences`, `src/native/offlineTrips.js`, called from the trips store), and
   the offline page shows them: each trip's flights and its itinerary day by day, read-only. Plain HTML and a small
   script, no React: it is a bundled file.
5. **Trip reminders**, local notifications (`@capacitor/local-notifications`, no server): the evening before a flight
   ("Mañana vuelas a Malta, 07:55 desde Madrid") and the morning of each itinerary day ("Hoy: Valletta, 4 paradas").
   Scheduled when a trip is saved or changed, cancelled when it is deleted. Asks permission the first time a trip is
   saved, not on opening the app.
6. **Add the trip to the calendar**: flights and towns as events (`@capacitor-community/calendar` or an `.ics` file
   opened with the share sheet). A button in the trip header, only in the app.
7. **Native share sheet** when sharing a trip (`@capacitor/share`), in `useShareLink`.
8. **Bookings in the system browser**: the "Reservar" links to the airlines open in an in-app Safari sheet
   (`@capacitor/browser`), not inside the shell. The links (and `book_click`) stay as they are.
9. **Polish Apple notices**: native icon and launch screen (the splash screens exist already), no pinch zoom,
   `safe-area-inset` (already used), haptics on the main buttons (`@capacitor/haptics`), and the status bar following
   the theme (`@capacitor/status-bar`).

### Later

- Price alerts with push notifications (a followed route drops in price): needs the followed routes in Supabase, a
  cron and APNs. The strongest reason to come back, but it needs a server side.
- A home-screen widget or a Live Activity on the flight's day: Swift code.
- Android.

## Sign-in inside the app

Google does not allow its sign-in inside an embedded web view (`disallowed_useragent`), so the current
`signInWithOAuth` redirect cannot run in the shell. In the app, both providers sign in natively and hand the token to
Supabase:

- Apple: the native Sign in with Apple sheet (`@capacitor-community/apple-sign-in`) → `supabase.auth.signInWithIdToken({ provider: "apple", token })`.
- Google: the native Google sign-in (`@capgo/capacitor-social-login` or similar) → `signInWithIdToken({ provider: "google", token })`.
- Email (magic link): the link must open the app, not Safari: a universal link for `lowfly.travel/api/auth/callback`
  (an `apple-app-site-association` file served by the site, and the "Associated Domains" entitlement in Xcode).

`src/supabase/signIn.js` picks the way: in the app → native; in a browser → as today. The session ends in the same
cookies, so the rest of the site does not know the difference.

## Review notes

- App Store Connect "Notes for review": what is native (offline trips, reminders, calendar, share), and a test account.
- Privacy: the policy page linked; the "App Privacy" form (account email, trips, analytics: Vercel's and Google's).
- Affiliate links and airline bookings are fine: nothing is sold inside the app, no in-app purchase rules apply.
- The Apple Developer Program: 99 $ a year, and a Mac with Xcode to build and upload.

## Cost to the web

None in speed: Capacitor's code only loads in the app. Every visitor gets two new things that are good on their own:
"Borrar cuenta" and Sign in with Apple.

## Tests (e2e)

The web side only (Playwright cannot drive the iOS shell):
- Deleting your account: a temporary account (`e2e/helpers/accounts.js`) deletes itself, its trips are gone and it is
  signed out.
- The Apple button is there next to Google's.
- Outside the app nothing native shows (no "Añadir al calendario") and sharing works as today.
- `mobile/offline/index.html` renders a trip from a stored sample (opened as a file, with Preferences mocked).

The shell itself is checked by hand on the simulator and a phone before each upload: offline page, reminders,
sign-in with each provider, booking links.

## Map of the code (where each piece goes)

| Piece | File |
|---|---|
| Shell config | `capacitor.config.json` |
| Xcode project | `ios/` |
| Offline page | `mobile/offline/index.html` |
| Is this the app? | `src/native/index.js` |
| Share, calendar, reminders, browser, offline trips | `src/native/*.js` |
| Delete my account | `src/server/account.js` (server action) + a button in `components/layout/AccountButton` |
| Sign-in in the app | `src/supabase/signIn.js` |
| Universal links | `src/app/.well-known/apple-app-site-association/route.js` |

## Open questions

- The app's name in the store: "Lowfly" or "Lowfly: vuelos baratos" (the subtitle helps search in the store).
- Reminders: which ones by default, and a switch to turn them off (settings menu).
- Whether to open the app on "Mis viajes" when there are trips saved, instead of the search.
