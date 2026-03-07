## Changes
[describe what this PR changes and why]

## Type of change
- [ ] New feature
- [ ] Bug fix
- [ ] KB update
- [ ] Documentation
- [ ] CI / tooling

## Checklist
- [ ] Tests pass locally (`npm test`)
- [ ] No new dependencies without justification in PR description
- [ ] All new UI strings added to `src/locales/en.json` (never hardcoded in components)

## Language Policy
CI automatically checks all locale files for forbidden phrases on every PR.
No manual action required. If CI fails with a language policy violation,
update the string in `src/locales/en.json` and push again.

## KB Changes (complete if this PR modifies the knowledge base)
- [ ] `src/data/knowledge-base.json` updated
- [ ] `public/kb-changelog.json` updated with new version entry
- [ ] `breaking_changes` flag set correctly per ARCHITECTURE.md Section 2 criteria
- [ ] `kb_version` bumped consistently in both files
- [ ] `CLAUDE.md` current KB version line updated
- [ ] If breaking: `breaking_changes: true` set in changelog entry

## localStorage Schema Changes (complete if this PR modifies gapsight_session structure)
- [ ] `schema_version` integer bumped
- [ ] Migration script created in `/scripts/migrate-localstorage-v{N}-to-v{N+1}.js`
- [ ] ARCHITECTURE.md Section 1 updated
- [ ] v2 migration plan in ARCHITECTURE.md Section 4 reviewed and updated
- [ ] Backwards compatibility period of minimum 90 days confirmed

## Reviewer notes
[anything specific you want the reviewer to check]
