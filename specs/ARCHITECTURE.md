# GapSight — Architecture & Frozen Contracts
### AI regulatory self-assessment for ML teams.

## Section 1: localStorage API Contract (FROZEN — schema_version: 1)

**Do not change this schema without a schema_version bump and migration script.**

```json
{
  "gapsight_session": {
    "schema_version": 1,
    "assessment_id": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
    "created_at": "2026-03-06T14:00:00.000Z",
    "last_modified_at": "2026-03-06T14:23:00.000Z",
    "kb_version": "1.0",
    "tos_accepted_at": "2026-03-06T14:00:00.000Z",
    "disclaimer_confirmed_at": "2026-03-06T14:22:00.000Z"
  }
}
```

**Type rules (strict):**
- `schema_version`: integer, never string. Current value: `1`
- `assessment_id`: UUID v4 string format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- All datetime fields: ISO 8601 with milliseconds and Z suffix: `2026-03-06T14:00:00.000Z`
- `kb_version`: semver string: `"1.0"`

**Migration scripts must use strict equality (`===`) when comparing schema_version.**
String/integer mismatch is a silent bug. Always check `typeof schema_version === 'number'`.

**Changing this schema requires:**
1. schema_version bump (integer increment)
2. Migration script in `/scripts/migrate-localstorage-v{N}-to-v{N+1}.js`
3. Backwards compatibility period of minimum 90 days
4. Update to v2 migration plan in Section 4

---

## Section 2: KB Changelog JSON Contract (FROZEN — schema_version: 1)

File location: `/public/kb-changelog.json`
Also served at: `/kb-changelog.json` (Vercel public dir)

```json
{
  "schema_version": 1,
  "current_version": "1.0",
  "versions": [
    {
      "version": "1.0",
      "semver": "1.0.0",
      "date": "2026-03",
      "changes": "Initial release.",
      "frameworks": {
        "eu_ai_act": "EU 2024/1689, Aug 2026 deadline",
        "nist_ai_rmf": "v1.0, January 2023",
        "iso_42001": "Published 2023"
      },
      "gpai_threshold_flops": "1e25",
      "next_review": "2026-06",
      "breaking_changes": false
    }
  ]
}
```

**Breaking change criteria (sets `breaking_changes: true`):**
A KB update IS a breaking change if it:
1. Changes any threshold value (pass or review)
2. Removes a metric from the knowledge base
3. Changes a framework reference (article number, subcategory, or clause)
4. Changes status logic for any existing metric

A KB update is NOT a breaking change if it:
1. Adds a new metric without modifying existing ones
2. Adds a new framework rule without modifying existing ones
3. Updates descriptive text, tooltips, or guidance without changing logic
4. Adds a new cross-metric validation rule

**When `breaking_changes: true`**, shared view must display:
"This assessment was generated with KB v[X]. Thresholds and mappings may have
changed. Consider re-running your assessment."

---

## Section 3: Share Link Storage Contract

**Storage:** Vercel KV
**Key format:** `assessment:{uuid}`
**TTL:** 12 months (31,536,000 seconds)
**PIN storage:** bcrypt hash of 4-8 digit PIN, stored in same KV entry

```json
{
  "assessment_id": "uuid-v4",
  "generated_at": "ISO-8601",
  "kb_version": "1.0",
  "tos_accepted_at": "ISO-8601",
  "disclaimer_confirmed_at": "ISO-8601",
  "profile": {
    "role": "provider | deployer | both",
    "gpai": false,
    "risk_category": "high-risk | limited | minimal | gpai",
    "deployment_status": "pre-deployment | post-deployment | pilot"
  },
  "inputs": {},
  "results": {},
  "cross_metric_warnings": [],
  "action_items": {},
  "risk_level": "CRITICAL | HIGH | MEDIUM | LOW",
  "risk_level_criteria": {},
  "pin_hash": "bcrypt-hash-or-null",
  "disclaimer": "Informative self-assessment only. Not legal advice. Not a compliance certificate."
}
```

**Extend:** POST `/api/share/extend/{uuid}` — resets TTL to 12 months from now
**Delete:** DELETE `/api/share/{uuid}` — immediate deletion
**PIN verify:** POST `/api/share/verify-pin/{uuid}` — body: `{ "pin": "1234" }`

---

## Section 4: v2 UUID Migration Plan

**Goal:** When account system is added in v2, users can migrate their
localStorage assessment history to their new account without losing history.

**v1 preparation (implement now):**
- Assessment UUID is generated at first form open and stored in `gapsight_session`
- UUID is included in JSON export under `assessment_id`
- UUID is included in share link metadata
- localStorage key `gapsight_assessment_history` stores array of past UUIDs:
  ```json
  { "gapsight_assessment_history": ["uuid-1", "uuid-2"] }
  ```

**v2 migration flow:**
1. User creates account in v2
2. Onboarding offers "Import previous assessments"
3. Client reads `gapsight_assessment_history` from localStorage
4. Client sends UUID list to `POST /api/migrate` with auth token
5. Server checks which UUIDs exist in KV store
6. Server associates found assessments with new account
7. Client clears `gapsight_assessment_history` from localStorage after success
8. User sees imported assessments in their account dashboard

**Contract:** UUID format and localStorage structure must not change in v1
without updating this migration plan and bumping schema_version.

---

## Section 5: Feedback API Contract

**Endpoint:** POST `/api/feedback`
**Rate limit:** 3 requests per IP per hour (Vercel Edge Middleware)
**Timeout:** Client enforces 10 second AbortController timeout

Request:
```json
{
  "issue_type": "wrong_mapping | outdated_requirement | unclear_description | technical_problem | other",
  "reference": "optional string, e.g. EU AI Act Article 10",
  "description": "string, min 20 characters",
  "honeypot": ""
}
```

Response 200:
```json
{ "success": true }
```

Response 400/429/500:
```json
{ "success": false, "message": "human readable error" }
```

**Client must:**
- Wait for server 200 before showing success message (no optimistic updates)
- Show error message with direct contact email on any non-200 or timeout
- Disable submit button for 30 seconds after any submission attempt

---

## Section 6: CI Pipeline Order

```
1. scripts/test-language-policy.sh    ← tests the CI script itself
2. scripts/check-language-policy.sh   ← checks codebase for violations
3. lint
4. test
5. build
6. deploy
```

Steps 1 and 2 must pass before any other step runs.
Build failure message on language policy violation must include:
- Forbidden phrase found
- File path and line number
- Instruction to fix in `src/locales/en.json`

---

## Section 7: KB Changelog Endpoint

**URL:** `/kb-changelog.json` (served from `/public/`)
**Cache-Control:** `public, max-age=3600`
**Rate limit:** 60 requests per IP per hour (Vercel Edge Middleware)

No authentication required (data is public).
Rate limit prevents aggressive scraping without blocking legitimate use.

---

## Section 8: Language Policy Enforcement

**Source of truth:** `/config/language-policy.json`
**Enforcement script:** `/scripts/check-language-policy.sh`
**Test script:** `/scripts/test-language-policy.sh`
**Scope:** All files in `src/locales/` and export templates

**PR process:**
CI runs automatically. No manual checkbox required.
If CI fails with language policy violation, developer must fix the string
in `src/locales/en.json` before the PR can be merged.

See `/config/language-policy.json` for current forbidden and required phrases.
