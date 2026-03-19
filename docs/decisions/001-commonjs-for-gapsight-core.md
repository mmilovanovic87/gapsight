# ADR 001: Use CommonJS for gapsight-core

## Status
Accepted

## Context
gapsight-core is the compliance scoring engine shared between the React frontend, the CLI tool (`bin/check.js`), and the GitHub Action. The GitHub Action uses `@vercel/ncc` to bundle into a single file for distribution. The CLI runs directly under Node.js.

## Decision
gapsight-core uses CommonJS (`require`/`module.exports`) instead of ES Modules.

## Rationale
- **GitHub Actions require CommonJS.** The `@vercel/ncc` bundler and the Actions runtime (`node20`) expect CommonJS entry points. Using ESM would require additional build steps and transpilation.
- **Node.js CLI compatibility.** The `bin/check.js` CLI tool must run with `node` directly, without a build step. CommonJS works out of the box in all Node.js versions 14+.
- **The browser frontend cannot import CommonJS.** This is an accepted tradeoff — the frontend has its own parallel copy of scoring logic in `src/logic/` using ES Modules. See [ADR 002](002-dual-constants-files.md).

## Consequences
- gapsight-core cannot be `import`ed directly by the Vite-bundled frontend.
- Constants must be manually kept in sync between `gapsight-core/constants.js` (CJS) and `src/logic/constants.js` (ESM). A CI test validates this sync.
