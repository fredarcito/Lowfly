---
paths: ["src/app/[lang]/terms/**"]
---
# terms

## Purpose
The terms of use: what Lowfly is (it sells no tickets), what its prices and AI itineraries are worth, fair use.

## Map
- Public API: `src/app/[lang]/terms/page.js`
- Files: 1. Most imported: `src/app/[lang]/terms/page.js`
- Used by: nothing outside the module
- Depends on: src/constants (3), src/components (2), src/i18n (1), src/providers (1), src/utils (1)
- `page.js`: renders `LegalDocument` (components/legal) with the text from `constants/terms` and a link to the privacy policy.

## How it works
The text and its last-updated day (`TERMS_UPDATED`) live in `src/constants/terms.js`; edit them there, not here.

## Traps
- When the terms change, update `TERMS_UPDATED` together with the text.
