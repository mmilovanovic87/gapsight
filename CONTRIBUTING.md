# Contributing to GapSight

Thank you for your interest in contributing to GapSight. This guide will get you from clone to first contribution.

## Quick start

```bash
git clone https://github.com/mmilovanovic87/gapsight.git
cd gapsight
npm install
npm start                   # Dev server at http://localhost:3000
```

## Running tests

```bash
# Frontend unit tests (Vitest)
npx vitest run

# gapsight-core unit tests (Jest)
cd gapsight-core && npm test && cd ..

# E2E tests (Playwright — requires dev server running)
npx playwright test --config=playwright.config.js

# Language policy check (must pass before commit)
bash scripts/check-language-policy.sh
```

## Project structure

GapSight has three layers. Know which layer you are working in:

| Layer | Directory | Runtime | Test runner |
|-------|-----------|---------|-------------|
| React frontend | `src/` | Browser (Vite) | Vitest + Playwright |
| Scoring engine | `gapsight-core/` | Node.js (CommonJS) | Jest |
| GitHub Action | `.github/actions/compliance-check/` | Node.js | Jest |

Read [`CLAUDE.md`](CLAUDE.md) for critical constraints that must never be violated.

## How to add a new metric

1. Add the metric definition to `src/data/knowledge-base.json` under the `metrics` array.
2. Add threshold constants to both `src/logic/constants.js` and `gapsight-core/constants.js` (they must stay in sync).
3. Add the form input to the appropriate section component in `src/components/assessment/`.
4. Add the field label to `src/locales/en.json` under `assessment.fields`.
5. Run `bash scripts/check-language-policy.sh` to verify language compliance.
6. Run all three test suites to verify nothing broke.

## How to add a new regulatory framework

1. Add the framework to `src/data/knowledge-base.json` — add `framework_mappings` entries to relevant metrics.
2. Add a display name entry to `FRAMEWORK_NAMES` in both `src/logic/constants.js` and `gapsight-core/constants.js`.
3. Add the framework option to `src/components/assessment/FrameworkSelectionStep.jsx`.
4. Update `docs/metric-mapping-rationale.md` with the rationale for each mapping.

## Branch naming

```
feature/short-description    # New features
fix/short-description        # Bug fixes
chore/short-description      # Maintenance, docs, refactoring
```

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add ISO 27001 framework support
fix: correct fairness threshold boundary check
chore: update dependencies
docs: add ADR for localStorage choice
refactor: extract download utility from ResultsPage
```

## Pull request process

1. Create a branch from `main` using the naming convention above.
2. Make your changes. Run all three test suites locally.
3. Run `bash scripts/check-language-policy.sh` — CI will reject violations.
4. Push and open a PR against `main`.
5. Fill in the PR template (`.github/pull_request_template.md`).
6. All CI checks must pass before merge.

## Code style rules

- All UI strings go in `src/locales/en.json` — never hardcode user-facing text.
- All numeric thresholds go in `src/logic/constants.js` — never hardcode magic numbers.
- React components use PascalCase filenames. Hooks use `use` prefix.
- Constants use `SCREAMING_SNAKE_CASE`.
- The logic layer (`src/logic/`) must have zero React imports.

## Key constraints

These are documented in [`CLAUDE.md`](CLAUDE.md) and are non-negotiable:

1. Language policy is CI-enforced. GapSight is an "informative self-assessment tool," never a "compliance platform."
2. Every threshold label must say: "GapSight default — not a regulatory requirement."
3. The localStorage schema is a frozen API contract. Never change field names without a schema version bump.
4. Feedback endpoint must return HTTP 200 before showing success (no optimistic UI).
