# GapSight Compliance Check — GitHub Action

Runs the GapSight compliance scoring engine against an assessment JSON file in your repository, printing a human-readable report to the Actions log and failing the workflow if the detected risk level exceeds a configurable threshold. This enables "compliance-as-tests" — treating AI compliance checks as a CI gate.

## Inputs

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `assessment-path` | `string` | No | `.gapsight/assessment.json` | Path to the assessment JSON file containing `profile` and `inputs` objects. |
| `knowledge-base-path` | `string` | No | `''` (uses bundled KB) | Path to a custom GapSight knowledge base JSON. When empty, the bundled KB from the GapSight repository is used. |
| `fail-on` | `string` | No | `HIGH` | Risk level that causes the action to fail. One of: `CRITICAL`, `HIGH`, `MEDIUM`, `NONE`. |

## Outputs

| Name | Type | Description |
|------|------|-------------|
| `passed` | `string` | `'true'` if the compliance check passed, `'false'` otherwise. |
| `risk-level` | `string` | Overall risk level: `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`. |
| `report-json` | `string` | File path to the generated JSON report artifact. |

## Example Workflow

```yaml
name: Compliance Check
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run GapSight Compliance Check
        id: compliance
        uses: mmilovanovic87/gapsight/.github/actions/compliance-check@v1
        with:
          assessment-path: '.gapsight/assessment.json'
          fail-on: 'HIGH'

      - name: Upload compliance report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: compliance-report
          path: .gapsight/compliance-report.json

      - name: Comment on PR
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `Compliance check failed with risk level: ${{ steps.compliance.outputs.risk-level }}`
            });
```

## Version Pinning

> **Version pinning:** Always pin to a tag (`@v1`) rather than `@main` in production pipelines. The `@main` reference may include unreleased breaking changes.

## Verbose Output

The action prints detailed information to the GitHub Actions log:

1. **Metrics Found** — Lists all metrics present in the assessment file with their values.
2. **Metrics Missing** — Lists metrics not provided and what default status was applied.
3. **Risk Assessment** — Shows the computed risk level and the fail-on threshold.
4. **Full Report** — Metric results, governance/process results, human oversight, cross-metric warnings, and framework summary.
5. **Final Verdict** — A clear pass/fail line:
   - `✅ Compliance check passed`
   - `❌ Compliance check failed: risk level {X} meets or exceeds fail-on threshold {Y}`

## Failure Modes

| Condition | Behavior |
|-----------|----------|
| Assessment file not found | Action fails with error message including the resolved path and instructions to create the file. |
| Assessment JSON is malformed | Action fails with a JSON parse error. |
| Assessment missing `profile` or `inputs` | Action fails with a descriptive error (e.g., "Assessment file must contain a 'profile' object."). |
| Knowledge base is invalid | Action fails with a schema validation error from gapsight-core. |
| Risk level meets or exceeds `fail-on` threshold | Action fails with message: "Compliance check failed: risk level X meets or exceeds threshold Y". |
| `fail-on` set to `NONE` | Action never fails on risk level (report-only mode). |
| Invalid `fail-on` value | Action fails with: "Invalid fail-on value. Must be one of: CRITICAL, HIGH, MEDIUM, NONE". |

## Bundle

`dist/index.js` is a committed ncc bundle — it is **not source code**. Do not edit it directly.

To rebuild after changing `index.js` or updating dependencies:

```bash
cd .github/actions/compliance-check
npm install
npm run build    # runs: ncc build index.js -o dist
```

Then commit the updated `dist/index.js`.
