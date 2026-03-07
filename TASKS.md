# GapSight — Claude Code Task List
### AI regulatory self-assessment for ML teams.

Use this file to track implementation progress.
Before starting any task, read the referenced spec file.

---

## Phase 1: Project foundation

- [ ] Init React + Tailwind project
- [ ] Create `/src/locales/en.json` with all UI strings (no hardcoded text in components)
- [ ] Copy `config/language-policy.json` to project root
- [ ] Copy `scripts/check-language-policy.sh` and `test-language-policy.sh` to project
- [ ] Set up GitHub Actions CI with language policy checks running first
- [ ] Create `.github/pull_request_template.md`
- [ ] Create `public/kb-changelog.json` from config
- [ ] Create `ARCHITECTURE.md` in project root from `specs/ARCHITECTURE.md`

**Read before starting:** CLAUDE.md, specs/ARCHITECTURE.md

---

## Phase 2: Knowledge base and logic

- [ ] Create `src/data/knowledge-base.json` with all 10 metrics, process requirements, Annex IV elements
- [ ] Create `src/logic/profile-filter.js` — filters KB by user profile
- [ ] Create `src/logic/scoring.js` — status logic per metric (see ALGORITHM.md Step 5)
- [ ] Create `src/logic/cross-metric.js` — 7 validation rules (see ALGORITHM.md Step 4)
- [ ] Create `src/logic/risk-level.js` — CRITICAL/HIGH/MEDIUM/LOW calibration (see ALGORITHM.md Step 6)

**Read before starting:** specs/ALGORITHM.md, specs/KNOWLEDGE-BASE.md

---

## Phase 3: Core UI components

- [ ] Layout: Header with sticky disclaimer bar, Clear Session button, nav links
- [ ] Layout: Footer with positioning statement
- [ ] Page: About
- [ ] Page: Privacy Policy
- [ ] Page: Terms of Service
- [ ] Page: KB Changelog (generated from kb-changelog.json)
- [ ] Modal: ToS acceptance (first visit, localStorage flag)
- [ ] Modal: Inline disclaimer (once per session, sessionStorage flag)
- [ ] Modal: Risk level criteria ("How is this calculated?")
- [ ] Modal: Confirm clear session

**Read before starting:** specs/PRODUCT.md, specs/ALGORITHM.md Step 0

---

## Phase 4: Assessment flow

- [ ] Step 1: Deployment context question
- [ ] Step 2: Onboarding — role, GPAI check, risk category decision tree
- [ ] Step 3: Form sections 1-5 (all profiles)
- [ ] Step 3: Form section 6 — GPAI obligations (conditional on gpai_flag)
- [ ] Step 3: Form section 7 — Governance with Annex IV element checklist
- [ ] localStorage persist: debounced save on every input change
- [ ] "Continuing previous assessment" restore on page load
- [ ] Input validation: range checks, min length, required fields per profile

**Read before starting:** specs/ALGORITHM.md Steps 1-3

---

## Phase 5: Results and export

- [ ] Cross-metric warnings panel (above summary)
- [ ] Summary panel with risk level, per-framework counts, "How calculated?" link
- [ ] Action items panel grouped by urgency (CRITICAL / HIGH / MEDIUM / ONGOING)
- [ ] JSON export with all required fields including UUID, timestamps, disclaimer
- [ ] HTML export with disclaimer header and canonical reference note
- [ ] Verify CI required_in_exports check passes on both export templates

**Read before starting:** specs/ALGORITHM.md Steps 4-8

---

## Phase 6: Share link and feedback

- [ ] Vercel KV setup
- [ ] API: POST `/api/share` — creates share link, optional PIN (bcrypt)
- [ ] API: GET `/api/share/{uuid}` — retrieves assessment, checks PIN if set
- [ ] API: POST `/api/share/verify-pin/{uuid}`
- [ ] API: POST `/api/share/extend/{uuid}` — resets TTL
- [ ] API: DELETE `/api/share/{uuid}`
- [ ] Share link UI: default PIN-on, user must actively choose no-PIN
- [ ] Shared view: KB version warning if assessment KB != current KB
- [ ] Shared view: "This assessment expires on [date]" visible
- [ ] API: POST `/api/feedback` with rate limiting, honeypot, 10s client timeout
- [ ] Feedback form UI with server-side confirm before success message
- [ ] 30 second submit button disable after submission

**Read before starting:** specs/ARCHITECTURE.md Sections 3, 5

---

## Phase 7: Final checks before deploy

- [ ] Run `test-language-policy.sh` — all 4 tests pass
- [ ] Run `check-language-policy.sh` against src/locales — clean
- [ ] Verify every threshold label shows "GapSight default — not a regulatory requirement"
- [ ] Verify every export contains required disclaimer phrases
- [ ] Verify share link default is PIN-protected
- [ ] Verify feedback form does not show success on timeout or server error
- [ ] Verify localStorage schema_version is integer 1 (not string)
- [ ] Verify assessment UUID appears in JSON export and share link metadata
- [ ] Verify sticky disclaimer bar visible on all pages
- [ ] Verify inline disclaimer shows once per session, resets on new session
- [ ] Verify KB version visible on all pages and in all exports
- [ ] Meta tags: no forbidden phrases in title or description
- [ ] Deploy to Vercel

---

## Notes for Claude Code

- Never hardcode UI strings in components. All text goes in `src/locales/en.json`.
- Never use optimistic UI updates on feedback submit.
- Never leave loading state unresolved. Always handle timeout and error cases.
- schema_version in localStorage is integer 1, never string "1".
- Share link default is PIN. User actively opts out.
- Read the relevant spec file before starting each phase.
