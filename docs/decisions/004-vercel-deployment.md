# ADR 004: Deploy on Vercel free tier

## Status
Accepted

## Context
GapSight needs hosting for a static React SPA and a small number of serverless API endpoints (share links, feedback). The project is open-source with no revenue model.

## Decision
Deploy on Vercel's free (Hobby) tier with automatic deployments from the `main` branch.

## Rationale
- **Zero cost.** The free tier provides sufficient bandwidth, serverless function invocations, and KV storage for an open-source project.
- **Built-in SPA routing.** `vercel.json` handles SPA rewrites (all paths to `index.html`) without a custom server.
- **Edge Functions.** The `/api/share` endpoints use Vercel Edge Functions with Vercel KV for share link storage — no external database needed.
- **Preview deployments.** Every PR gets an automatic preview URL, making code review easier.

## Consequences
- Vendor lock-in on Vercel KV for share links. Migration would require replacing the KV calls in `api/share/*.js`.
- The free tier has rate limits on serverless invocations. This is acceptable for current traffic levels.
- No custom domain on the free tier (uses `*.vercel.app`).
