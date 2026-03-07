# ARCHITECTURE.md — Frozen API Contracts

Changes to anything in this file require:
1. A version bump in the relevant schema
2. A migration script if existing data is affected
3. A backwards-compatibility period of minimum 90 days

---

## Section 1: localStorage API Contract — schema_version 1

**Key:** `gapsight_session`

```json
{
  "gapsight_session": {
    "schema_version": 1,
    "assessment_id": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
    "created_at": "2026-03-06T14:00:00.000Z",
    "last_modified_at": "2026-03-06T14:23:00.000Z",
    "kb_version": "1.0",
    "tos_accepted_at": "2026-03-06T14:00:00.000Z"
  }
}
```

**Type constraints (strict — never relax):**
- `schema_version`: integer, never string. Current value: 1.
- `assessment_id`: UUID v4 string format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- All datetime fields: ISO 8601 with milliseconds and Z suffix: `2026-03-06T14:00:00.000Z`
- `kb_version`: semver string without "v" prefix: `"1.0"` not `"v1.0"`

**Migration rule:**
Migration scripts must use strict equality (`===`) when comparing `schema_version`
to avoid string/integer type mismatch bugs. Example: `if (session.schema_version === 1)`.

**Key:** `tos_accepted`
```json
{
  "tos_accepted": true,
  "timestamp": "2026-03-06T14:00:00.000Z"
}
```

---

## Section 2: KB Changelog JSON Contract

**File:** `/public/kb-changelog.json`

```json
{
  "schema_version": 1,
  "current_version": "string (semver, required)",
  "versions": [
    {
      "version": "string (semver, required)",
      "semver": "string (full semver, required)",
      "date": "string (YYYY-MM, required)",
      "changes": "string (required)",
      "frameworks": {
        "eu_ai_act": "string (required)",
        "nist_ai_rmf": "string (required)",
        "iso_42001": "string (required)"
      },
      "gpai_threshold_flops": "string (scientific notation, required)",
      "next_review": "string (YYYY-MM, required)",
      "breaking_changes": "boolean (required)"
    }
  ]
}
```

All fields are required for every version entry.
`schema_version` is integer (not string).

### Breaking changes definition

Set `breaking_changes: true` if the update:
- Changes any threshold value (pass or review)
- Removes a metric from the knowledge base
- Changes a framework reference (article number, subcategory, or clause)
- Changes status logic for any existing metric

Set `breaking_changes: false` if the update:
- Adds a new metric without modifying existing ones
- Adds a new framework rule without modifying existing ones
- Updates descriptive text, tooltips, or guidance without changing logic
- Adds a new cross-metric validation rule

When `breaking_changes: true`, the shared view must display:
"This assessment was generated with KB v[X]. Thresholds and mappings may
have changed. Consider re-running your assessment."

---

## Section 3: v2 UUID Migration Plan

When an account system is added in v2, the onboarding flow must offer
"Import previous assessments" to preserve continuity for v1 users.

**Migration flow:**
1. User creates v2 account
2. Onboarding detects `gapsight_session` in localStorage
3. Client reads `assessment_id` from localStorage
4. Client sends `{ assessment_ids: ["uuid1", "uuid2"] }` to `/api/migrate`
5. Server checks which UUIDs exist in Vercel KV
6. Server associates found assessments with new account
7. On success: client clears localStorage, shows "X assessments imported"
8. On partial success: shows which were found and which were not

**Contract for /api/migrate:**
- Method: POST
- Auth: required (v2 session token)
- Body: `{ "assessment_ids": ["string"] }` (array, max 50)
- Response: `{ "imported": ["uuid"], "not_found": ["uuid"] }`
- Idempotent: safe to call multiple times

**Prerequisite:** assessment_id must be included in JSON export and share link
metadata from v1 so users who lost localStorage can still recover via UUID.

---

## Section 4: Language Policy Enforcement

**Config file:** `config/language-policy.json`
**Enforcement script:** `scripts/check-language-policy.sh`
**Test suite:** `scripts/test-language-policy.sh`

CI pipeline order:
```
1. scripts/test-language-policy.sh   ← verifies the script works
2. scripts/check-language-policy.sh  ← scans codebase
3. npm run build
```

Build fails if step 1 or step 2 exits non-zero.

Every new UI string must be added to `src/locales/en.json`.
Strings must not be hardcoded in component files.
The CI script scans `src/locales/` only — strings in components are not scanned.

---

## Section 5: API endpoints

All server-side endpoints run as Vercel Edge Functions.

| Endpoint | Method | Purpose | Rate limit |
|----------|--------|---------|------------|
| /api/feedback | POST | Submit issue report | 3/hour/IP |
| /api/share/create | POST | Create share link | 10/hour/IP |
| /api/share/verify | POST | Verify PIN | 10/hour/IP |
| /api/share/extend | POST | Extend TTL | 5/day/UUID |
| /api/share/delete | DELETE | Delete share link | 10/hour/IP |
| /public/kb-changelog.json | GET | KB changelog (static) | 60/hour/IP |

Rate limits enforced via Vercel Edge Middleware.
All endpoints return appropriate HTTP status codes.
No endpoint returns user data other than the requesting user's own assessment.

---

## Section 6: PR template

File: `.github/pull_request_template.md`

```markdown
## Changes
[describe changes]

## Checklist
- [ ] Tests pass
- [ ] No new dependencies without justification
- [ ] UI strings added to src/locales/en.json (not hardcoded in components)

## Language Policy
CI automatically checks all locale files for forbidden phrases on every PR.
No manual action required. If CI fails with a language policy violation,
update the string in src/locales/en.json before pushing again.

## KB Changes (if applicable)
- [ ] public/kb-changelog.json updated with new version entry
- [ ] breaking_changes flag set correctly per ARCHITECTURE.md Section 2
- [ ] schema_version bumped if localStorage contract changed
- [ ] Migration script written if breaking_changes: true
```
