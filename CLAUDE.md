# GapSight — Claude Code Entry Point
### AI regulatory self-assessment for ML teams.

## What is this project?

GapSight is an **informative self-assessment tool** that helps AI teams identify
potential compliance gaps relative to EU AI Act, NIST AI RMF, and ISO/IEC 42001.

It is NOT a compliance platform, NOT legal advice, NOT a certification system.
This positioning must be enforced consistently across every line of UI text,
every export, and every meta tag. See `config/language-policy.json`.

---

## Spec files — read these before writing any code

| File | Read when |
|------|-----------|
| `CLAUDE.md` | Always — this file |
| `spec/01-positioning.md` | Writing any UI text, copy, or exports |
| `spec/02-user-flow.md` | Building any screen, form, or navigation |
| `spec/03-form-sections.md` | Building the assessment form |
| `spec/04-logic-engine.md` | Building status logic, cross-metric rules, risk level |
| `spec/05-export-share.md` | Building export, share link, feedback |
| `spec/06-architecture.md` | Any backend, storage, CI, or API contract work |
| `config/language-policy.json` | Writing or reviewing any UI string |

---

## Tech stack

- **Frontend:** Single-page React app
- **Backend:** Vercel Edge Functions (minimal — share link + feedback only)
- **Storage:** Vercel KV (share links, TTL 12 months)
- **CI:** GitHub Actions
- **Deployment:** Vercel free tier

---

## Critical constraints — never violate these

1. Language policy is enforced by CI. Run `scripts/check-language-policy.sh`
   before every commit. Build fails on violation.

2. Every threshold label in UI must read:
   "GapSight default — not a regulatory requirement"

3. Disclaimer banner is a sticky single-line header, always visible on results page.

4. Share link default is PIN-protected. User must actively choose "without PIN."

5. Inline disclaimer fires once per session via sessionStorage flag, not per generate.

6. localStorage schema is a frozen API contract. Never change field names or types
   without bumping schema_version and writing a migration script.
   See `spec/06-architecture.md`.

7. Feedback endpoint must return HTTP 200 before showing success message.
   Never use optimistic UI update for feedback submission.

8. /api/feedback has 10-second client-side AbortController timeout.
   On timeout: show error with direct contact email, never hang in loading state.

---

## v1 scope

### In scope
- Full assessment form (Sections 1–7)
- Cross-metric validation engine (7 rules)
- Risk level calculation with transparent criteria
- Share link with optional PIN (default: with PIN)
- HTML + JSON export
- Inline feedback form with server-side confirm
- KB changelog page (human-readable + /public/kb-changelog.json)
- localStorage session persist + Clear Session button in header
- ToS + Privacy Policy static pages
- About page with explicit positioning statement

### Out of scope for v1
- PDF export
- Account system
- Owner/assignee fields on action items
- Email notifications
- Multi-language (string keys used throughout for future i18n)
- Offline PWA / service worker
- Assessment versioning / delta view

---

## Folder structure

```
/
├── CLAUDE.md                     ← this file, always read first
├── ARCHITECTURE.md               ← frozen API contracts
├── .github/
│   └── pull_request_template.md  ← PR checklist
├── config/
│   └── language-policy.json      ← forbidden + required phrases
├── scripts/
│   ├── check-language-policy.sh  ← CI enforcement
│   └── test-language-policy.sh   ← test suite for CI script
├── spec/
│   ├── 01-positioning.md
│   ├── 02-user-flow.md
│   ├── 03-form-sections.md
│   ├── 04-logic-engine.md
│   ├── 05-export-share.md
│   └── 06-architecture.md
├── src/
│   ├── locales/
│   │   └── en.json               ← all UI strings (scanned by CI)
│   ├── api/
│   │   └── feedback.js           ← feedback with AbortController timeout
│   └── kb/
│       └── knowledge-base.json   ← core compliance knowledge base
└── public/
    └── kb-changelog.json         ← machine-readable KB changelog
```
