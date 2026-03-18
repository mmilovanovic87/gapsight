# GapSight

**AI regulatory self-assessment for ML teams.**

GapSight is a free, open-source tool that helps AI teams identify potential compliance gaps relative to **EU AI Act**, **NIST AI RMF**, and **ISO/IEC 42001**. It is an informative self-assessment tool — not a compliance platform, not legal advice, and not a certification system.

## Architecture

```
src/
├── api/            # Client-side API calls (share links, feedback)
├── components/     # Reusable React components
│   └── assessment/ # Assessment form section components
├── data/           # Static data (knowledge base, templates)
├── hooks/          # Custom React hooks (state management)
├── locales/        # i18n strings (en.json, CI-scanned)
├── logic/          # Pure business logic (no React dependency)
│   ├── constants.js        # All thresholds, weights, and limits
│   ├── scoring.js          # Metric status computation
│   ├── compute-results.js  # Orchestrates full assessment
│   ├── cross-metric.js     # 7 cross-metric validation rules
│   ├── risk-level.js       # Risk level calculation
│   ├── action-items.js     # Remediation action generation
│   ├── profile-filter.js   # KB filtering by user profile
│   └── export-*.js         # JSON, HTML, PDF export
└── pages/          # Page-level route components

api/                # Vercel Edge Functions (share link endpoints)
config/             # Language policy, KB config
scripts/            # CI enforcement scripts
specs/              # Product and architecture specifications
tests/e2e/          # Playwright E2E test suite
```

### Key design decisions

- **Logic layer is framework-agnostic.** All scoring, validation, and computation in `src/logic/` has zero React dependency. It can be imported as plain Node.js modules.
- **State is localStorage-based.** No server-side state for assessments. Everything persists client-side via `useAssessmentStore` hook.
- **Language policy is CI-enforced.** Forbidden phrases (e.g., "compliance platform") are scanned on every build. See `config/language-policy.json`.
- **Knowledge base is a frozen API contract.** Schema changes require version bumps and migration scripts. See `ARCHITECTURE.md`.

### Data flow

```
User Input → useAssessmentStore (localStorage)
           → computeResults(inputs, profile)
           → profile-filter → scoring → cross-metric → risk-level → action-items
           → ResultsPage render + export functions
```

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Development

```bash
npm install
npm start         # Dev server on http://localhost:3000
```

### Testing

```bash
npm test                # Unit tests (Jest)
npm run test:e2e        # E2E tests (Playwright, requires npm start)
```

### Build

```bash
npm run build           # Production build → build/
```

### Deployment

Vercel auto-deploys on push to `main`. No manual deployment step needed.

Configuration: `vercel.json` handles SPA routing and API rewrites.

## Specification documents

Detailed specs live in the `specs/` directory:

| Document | Contents |
|----------|----------|
| `specs/PRODUCT.md` | Product positioning, scope, non-goals |
| `specs/ALGORITHM.md` | Complete scoring algorithm walkthrough |
| `specs/ARCHITECTURE.md` | API contracts, storage schemas |
| `specs/KNOWLEDGE-BASE.md` | KB structure, metrics, framework mappings |

## Contributing

1. Read `CLAUDE.md` for project constraints
2. Run `scripts/check-language-policy.sh` before committing
3. All UI strings must go in `src/locales/en.json`
4. Never add hardcoded thresholds — use `src/logic/constants.js`
5. Follow the PR template in `.github/pull_request_template.md`

## Architecture & Developer Guide

GapSight has a three-layer architecture:

1. **React frontend** (`src/`) — Single-page assessment UI. All scoring logic is delegated to the logic layer.
2. **gapsight-core** (`gapsight-core/`) — Standalone Node.js module containing the compliance scoring engine. Zero UI dependencies. Can be used independently in any Node.js project. See [`gapsight-core/README.md`](gapsight-core/README.md) for API docs and usage examples.
3. **GitHub Action** (`.github/actions/compliance-check/`) — Runs gapsight-core as a CI gate, enabling "compliance-as-tests" — automated compliance checks that run on every push or PR, failing the build if risk exceeds a threshold. See [`.github/actions/compliance-check/README.md`](.github/actions/compliance-check/README.md) for setup and configuration.

**Compliance-as-tests** means treating AI compliance assessments as automated test gates in your CI/CD pipeline, so compliance regressions are caught before code reaches production.

### Recommended workflow

1. Fill in your assessment in the GapSight UI.
2. Click **"Export for CI"** on the Results page to download `assessment.json`.
3. Commit the file as `.gapsight/assessment.json` in your repository.
4. Add the GitHub Action to your CI pipeline:

```yaml
- uses: mmilovanovic87/gapsight/.github/actions/compliance-check@v1
  with:
    assessment-path: '.gapsight/assessment.json'
    fail-on: 'HIGH'
```

Before pushing to CI, you can run a local dry-run: `cd gapsight-core && node bin/check.js ../.gapsight/assessment.json`

See [`gapsight-core/README.md`](gapsight-core/README.md) for full CLI documentation.

### Metric-to-regulation mapping

For a detailed explanation of why each metric maps to specific regulatory articles, see [`docs/metric-mapping-rationale.md`](docs/metric-mapping-rationale.md).

## License

See repository for license details.
