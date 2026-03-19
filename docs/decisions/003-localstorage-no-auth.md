# ADR 003: Use localStorage with no authentication

## Status
Accepted

## Context
GapSight needs to persist assessment state (profile, metric inputs, session metadata) across page reloads. The project is a free, open-source tool positioned as an informative self-assessment — not a platform with user accounts.

## Decision
All assessment data is stored in the browser's `localStorage`. There is no user authentication, no server-side database for assessments, and no account system.

## Rationale
- **Privacy by design.** Assessment data contains potentially sensitive information about an organization's AI compliance posture. Storing it entirely client-side means GapSight never sees or retains this data on any server.
- **Zero infrastructure cost.** No database, no user management, no session handling. This keeps the project deployable on Vercel's free tier with no operational overhead.
- **Appropriate for v1 scope.** The target user is an ML engineer doing a self-assessment. Multi-user collaboration, assessment history, and team management are explicitly out of scope for v1.
- **Frozen schema.** The localStorage key names and value types are documented in `ARCHITECTURE.md` as a frozen API contract. Any schema change requires a version bump and migration script.

## Consequences
- Users lose their assessment if they clear browser data.
- No cross-device sync. An assessment started on one machine cannot be resumed on another (without using the share link feature).
- The share link feature (`/api/share`) uses server-side Vercel KV storage with a 12-month TTL — this is the only server-side data persistence.
