# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `gapsight-core` standalone Node.js compliance scoring module
- GitHub Action for CI/CD compliance checks (compliance-as-tests)
- KB schema validation in `runComplianceCheck` with descriptive error messages
- `gapsight-core/README.md` with full API reference and usage examples
- `.github/actions/compliance-check/README.md` with workflow examples
- `CHANGELOG.md`

### Changed
- `src/logic/constants.js` now imports scoring constants from `gapsight-core` (single source of truth)
- Framework list in `risk-level.js` derived from `FRAMEWORK_NAMES` instead of hardcoded array
- Action unit test imports real `shouldFail` function instead of re-implementing it

### Fixed
- Bundled GitHub Action with `@vercel/ncc` to resolve missing `node_modules` on Actions runner

## [0.2.0] - 2026-03-09

### Added
- Template picker wizard with 6 domain-specific assessment templates
- Section completion indicators on assessment tabs
- Annex IV element grouping in action items

### Fixed
- Framework and risk category selection flow in onboarding
- Governance evidence required when status is "Yes"
- Section completion logic for robustness and explainability tabs
- E2E test selectors (23/23 passing)

## [0.1.0] - 2026-03-07

### Added
- Core assessment form (Sections 1-7: accuracy, fairness, robustness, explainability, transparency, human oversight, governance)
- Cross-metric validation engine (7 rules)
- Risk level calculation (CRITICAL / HIGH / MEDIUM / LOW)
- EU AI Act, NIST AI RMF, and ISO/IEC 42001 framework support
- Framework selection with filtered results
- Share link with optional PIN protection
- HTML and JSON export
- PDF export
- Inline feedback form with server-side confirmation
- KB changelog page
- localStorage session persistence with Clear Session button
- Terms of Service and Privacy Policy pages
- About page with positioning statement
- Language policy CI enforcement
- Landing page
