# GapSight — Product Specification
### AI regulatory self-assessment for ML teams.

## Positioning (non-negotiable)

GapSight is an **informative self-assessment tool**.

| What it IS | What it is NOT |
|------------|----------------|
| Informative self-assessment tool | Compliance platform |
| Gap identification aid | Legal advice |
| Structured checklist generator | Certification system |
| Starting point for compliance work | Substitute for legal counsel |
| Free, no-registration tool | Audit-ready report generator |

This positioning must be consistent across: UI labels, page titles, meta tags,
og:description, About page, ToS, Privacy Policy, all exports, and any marketing copy.

---

## Target user

ML engineers and AI product teams at companies developing or deploying AI systems
who need a structured starting point for understanding which regulatory requirements
may apply to their system, based on their own evaluation metrics.

---

## Core user flow (v1)

```
Landing page
    ↓
Terms of Service (first visit only)
    ↓
Deployment context question
    ↓
Onboarding (role + GPAI check + risk category decision tree)
    ↓
Metric input form (6-7 sections, filtered by profile)
    ↓
Inline disclaimer modal (once per session)
    ↓
Results page (cross-metric warnings + summary + action items)
    ↓
Export / Share link
```

---

## Pages and persistent UI

### Header (every page)
```
[GapSight logo] [New Assessment] [KB Changelog] [About] [Privacy] [Terms]
                                                              [Clear Session 🗑]
```

### Sticky disclaimer bar (every page, below header)
```
ℹ GapSight — AI regulatory self-assessment for ML teams. Results are not legal advice.
  KB v1.0 | Mar 2026
```
- Single line, fixed below header, never blocks content
- On results page: light yellow background

### Footer (every page)
```
GapSight — AI regulatory self-assessment for ML teams.
Not legal advice. Not a compliance platform.
KB v1.0 | March 2026

[Privacy Policy] [Terms of Service] [About] [KB Changelog] [Report an Issue]

© 2026 GapSight
```

---

## About page content

```
GapSight
AI regulatory self-assessment for ML teams.

What is GapSight?

GapSight is an informative self-assessment tool that helps AI teams identify
potential gaps in their evaluation practices relative to EU AI Act, NIST AI RMF,
and ISO/IEC 42001 requirements.

What GapSight is not:
• Not a compliance platform
• Not legal advice
• Not a certification system
• Not a substitute for qualified legal counsel

Who is it for?
ML engineers and AI product teams who want a structured starting point for
understanding which regulatory requirements may apply to their system, based
on their own evaluation metrics.

How should results be used?
As a checklist to identify areas that may need attention, not as a compliance
certificate. Always consult a qualified professional before making deployment
decisions.

Knowledge Base version: v1.0, March 2026
Next scheduled review: June 2026
```

---

## Terms of Service (key clauses)

- Definition: informative tool, not compliance platform, not legal advice, not certification
- Liability: limited to KB accuracy at time of generation
- User responsibility: sole responsibility for all decisions based on results
- KB currency: no real-time guarantee, KB version always visible
- Language: English only in v1
- ToS version and date visible at bottom

Timestamp of acceptance stored in localStorage and included in every export.

---

## Privacy Policy (key clauses)

- Data collected: session data in localStorage; share link content on server only if user explicitly creates link
- Storage: Vercel KV, TTL 12 months, no PII
- Third parties: none
- User rights: delete share link at any time; GDPR contact email provided
- Role: GapSight is data processor, user is data controller

---

## v1 feature scope

**In scope:**
- Full metric input form with profile filtering
- Decision tree risk classification
- Cross-metric validation engine (7 rules)
- Risk level calculation (CRITICAL / HIGH / MEDIUM / LOW)
- Share link with optional PIN (default: PIN on)
- HTML export
- JSON export
- KB changelog page
- Inline feedback form
- localStorage session persistence

**Out of scope for v1 (planned v2):**
- PDF export
- Account system
- Owner/assignee on action items
- Assessment versioning and delta view
- Multilingual support
- Offline / PWA support
- Email notification for KB updates

---

## v2 preparation (implement in v1 architecture)

- All UI strings in `src/locales/en.json` with string keys (enables future i18n)
- Assessment UUID in localStorage with frozen schema (enables v2 versioning)
- UUID included in JSON export and share link metadata (enables v2 migration)
- UUID migration plan documented in ARCHITECTURE.md Section 4
