# gapsight-core

Framework-agnostic compliance scoring engine for GapSight. Evaluates AI system assessments against EU AI Act, NIST AI RMF, and ISO/IEC 42001 frameworks. This module contains zero UI dependencies and runs in any Node.js environment.

## Installation

```bash
# Local dependency (from the GapSight monorepo)
npm install ./gapsight-core

# Or require directly by path
const { runComplianceCheck } = require('./gapsight-core');
```

## API Reference

### `runComplianceCheck(assessment)`

Runs a full compliance check and returns a structured report.

#### Input: `assessment` object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `knowledgeBase` | `object` | Yes | The GapSight knowledge base JSON. Must contain `metrics` (array) and `process_requirements` (array). |
| `profile` | `object` | Yes | User profile describing the AI system context. |
| `profile.role` | `string` | Yes | `'provider'` or `'deployer'` |
| `profile.gpai_flag` | `boolean` | Yes | Whether this is a General Purpose AI system |
| `profile.risk_category` | `string` | Yes | `'high-risk'`, `'limited'`, or `'gpai'` |
| `profile.deployment_status` | `string` | Yes | `'pre-deployment'`, `'post-deployment'`, or `'pilot'` |
| `profile.frameworks_selected` | `string[]` | No | Framework IDs to evaluate. Defaults to all: `['eu_ai_act', 'nist_ai_rmf', 'iso_42001']` |
| `inputs` | `object` | Yes | All metric values and form inputs (accuracy scores, fairness metrics, governance answers, etc.) |

#### Output: report object

| Field | Type | Description |
|-------|------|-------------|
| `passed` | `boolean` | `true` if risk level is LOW or MEDIUM |
| `riskLevel` | `object` | `{ level: 'CRITICAL'\|'HIGH'\|'MEDIUM'\|'LOW', message: string, criteria: object }` |
| `riskLevel.criteria` | `object` | `{ total, critical, failed, reviewed, crossCritical, failRate, reviewRate }` |
| `metricResults` | `array` | Per-metric results with `id`, `label`, `status`, `value`, `framework_mappings`, thresholds |
| `processResults` | `array` | Per-process requirement results with `id`, `label`, `status`, `value`, `framework_mappings` |
| `oversightResult` | `object\|null` | Human oversight result (null if no oversight answers provided) |
| `crossMetricWarnings` | `array` | Cross-metric findings: `{ id, severity: 'CRITICAL'\|'WARNING', message }` |
| `frameworkSummary` | `object` | Per-framework counts: `{ [framework]: { pass, review, fail, critical, total } }` |
| `contextFlags` | `string[]` | Active context flags (e.g., `'SMALL_TEST_SET'`, `'STALE_MODEL_24M'`) |
| `generatedAt` | `string` | ISO 8601 timestamp of report generation |

## Usage Example

```js
const { runComplianceCheck } = require('gapsight-core');
const knowledgeBase = require('./src/data/knowledge-base.json');

const report = runComplianceCheck({
  knowledgeBase,
  profile: {
    role: 'provider',
    gpai_flag: false,
    risk_category: 'high-risk',
    deployment_status: 'pre-deployment',
    frameworks_selected: ['eu_ai_act'],
  },
  inputs: {
    overall_accuracy: 0.95,
    f1_score: 0.92,
    auc_roc: 0.97,
    test_set_size: 5000,
    demographic_parity_diff: 0.03,
    equalized_odds_diff: 0.02,
    bias_mitigation_applied: true,
    bias_mitigation_method: 'Reweighing applied to training data',
    human_oversight: { q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes', q5: 'yes' },
    governance: {
      risk_management_system: { status: 'yes' },
      technical_documentation: { status: 'yes' },
    },
  },
});

console.log(`Passed: ${report.passed}`);
console.log(`Risk Level: ${report.riskLevel.level}`);
console.log(`Metrics evaluated: ${report.metricResults.length}`);
console.log(`Cross-metric warnings: ${report.crossMetricWarnings.length}`);

for (const result of report.metricResults) {
  console.log(`  ${result.label}: ${result.status}`);
}
```

## Error Handling

`runComplianceCheck` throws descriptive `Error` instances for invalid input:

```js
try {
  const report = runComplianceCheck({
    knowledgeBase: null,
    profile: {},
    inputs: {},
  });
} catch (err) {
  console.error(err.message);
  // => "assessment.knowledgeBase must be a non-null object."
}
```

Validated conditions:
- `assessment` must be a non-null object
- `assessment.knowledgeBase` must be a non-null object
- `assessment.knowledgeBase.metrics` must be an array
- `assessment.knowledgeBase.process_requirements` must be an array
- `assessment.profile` must be a non-null object
- `assessment.inputs` must be a non-null object

## Also exports

- `constants` — all scoring thresholds, weights, and framework names used by the engine

## Repository

This module is part of the [GapSight](https://github.com/your-org/gapsight) project.
