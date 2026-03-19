# ADR 002: Maintain dual constants files

## Status
Accepted

## Context
Scoring thresholds (e.g., `OVERSIGHT_PASS_THRESHOLD = 0.80`) are used by both the browser frontend (ES Modules via Vite) and gapsight-core (CommonJS for Node.js/GitHub Actions). A single source of truth is not possible because the two module systems are incompatible at import time (see [ADR 001](001-commonjs-for-gapsight-core.md)).

## Decision
Maintain two copies of scoring constants:
- `gapsight-core/constants.js` — CommonJS, used by the scoring engine, CLI, and GitHub Action.
- `src/logic/constants.js` — ES Modules, used by the React frontend.

Both files contain a header comment warning that changes must be mirrored.

## Rationale
- **No build step for gapsight-core.** Adding a transpilation step (e.g., Babel, tsup) would add complexity and slow down CI for a module that is intentionally zero-dependency.
- **CI validation.** A test in `gapsight-core/__tests__/constants.test.js` reads the browser constants file and asserts that critical values match, catching sync drift automatically.

## Consequences
- Developers must update both files when changing a scoring threshold.
- The CI test prevents silent drift. If values diverge, the test fails with a clear message.
