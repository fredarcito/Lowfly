---
paths: ["src/app/[lang]/privacy/**"]
---
# privacy

## Purpose
The privacy policy page, in Spanish and English.

## Map
- Public API: `src/app/[lang]/privacy/page.js`
- Files: 1. Most imported: `src/app/[lang]/privacy/page.js`
- Used by: nothing outside the module
- Depends on: src/constants (3), src/components (2), src/i18n (1), src/providers (1), src/utils (1)
- `page.js`: renders `LegalDocument` (components/legal) with the text from `constants/privacy` and a link to the terms.

## How it works
The text and its last-updated day (`PRIVACY_UPDATED`) live in `src/constants/privacy.js`; edit them there, not here.

## Decisions
- 2026-10-15: the page exists because Google requires one to publish sign-in with Google, and the app stores need it too (page comment).

## Traps
- When the policy changes, update `PRIVACY_UPDATED` together with the text.
