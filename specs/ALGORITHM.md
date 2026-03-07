# GapSight — Algorithm Specification (v8)
### AI regulatory self-assessment for ML teams.

## Step 0: Legal framework

### 0a. First visit — Terms of Service
Full-screen modal on first visit. Two buttons: "I understand and accept" / "Exit".
Timestamp stored in localStorage under `gapsight_session.tos_accepted_at`.
Without acceptance, app does not proceed.

### 0b. Inline disclaimer — once per session
Shown once before first Generate in a session.
SessionStorage flag: `gapsight_disclaimer_shown = true`.
NOT shown again while session is active. Resets on new session.

Text: "Results are informative and do not guarantee regulatory compliance.
Consult a qualified legal or compliance professional before deployment."
One button: "Understood, generate."

Timestamp stored in localStorage and included in every export.

### 0c. Sticky disclaimer bar
Single line, fixed below header on every page.
Light yellow background on results page.
Never dismissible. Never blocks content.

```
ℹ GapSight — AI regulatory self-assessment for ML teams.
  Results are not legal advice.  KB v1.0 | Mar 2026
```

### 0d. Clear Session button
Visible in header on every page.
Confirm dialog before clearing: "This will delete your current assessment. Are you sure?"
Buttons: "Yes, clear" / "Cancel".
On confirm: clears all localStorage gapsight_ keys.

---

## Step 1: Deployment context

Single question, mandatory:

**Is your AI system already in production?**
- Not yet, preparing for deployment → pre-deployment flag
- Yes, already in production → post-deployment flag
- Partially, pilot or beta phase → both flags active

Effect on output:
- pre-deployment: action items prioritize documentation and testing
- post-deployment: action items prioritize monitoring, drift, incident response
- pilot: both priority sets shown, labeled accordingly

---

## Step 1b: Framework Selection

Decision tree to determine which regulatory frameworks apply.

### Questions

```
Q1: Do users of your system currently reside in the EU,
    or is your company registered in the EU?
    → Yes → EU AI Act flagged (mandatory, legal obligation)
    → No  → Q2

Q2: Is your company based in the US, or do you work with
    US federal agencies or US-regulated clients?
    → Yes → NIST AI RMF flagged (recommended)
    → No  → Q3

Q3: Do your clients or partners require ISO certification,
    or is it a contractual requirement in your industry?
    → Yes → ISO/IEC 42001 flagged
    → No  → Q4

Q4: Are you looking for a globally recognized framework
    for internal AI risk governance, without certification
    requirements?
    → Yes → NIST AI RMF flagged (de facto global standard)
    → No  → Q5

Q5: Do you plan to expand to the EU market within the
    next 12 months?
    → Yes → EU AI Act flagged (proactive)
    → No  → NIST AI RMF flagged as default starting point
```

### Rules

- Multiple frameworks can be flagged simultaneously.
- User sees a result card for each flagged framework with a one-sentence
  explanation of why it applies.
- User can override: add or remove any framework with acknowledgment:
  "You are manually adjusting the suggested frameworks. GapSight will
  assess against all selected frameworks."
- If EU AI Act is flagged, show note:
  "The EU AI Act applies extraterritorially — if your users are in the EU,
  the regulation applies regardless of where your company is based."
- Selected frameworks stored in profile as:
  `frameworks_selected: ["eu_ai_act", "nist_ai_rmf", "iso_42001"]`
- If user skips this step or selects all: all three frameworks included
  (current behavior preserved).
- This step appears after Step 1 (Deployment context) and before
  Step 2 (Onboarding).

---

## Step 2: Onboarding

### Role (mandatory)
- Provider (builds and places AI system on market)
- Deployer (uses third-party AI system in own business)
- Both

### GPAI check — asked FIRST, before risk category
"Is your system a foundation model, large language model, or other general-purpose
AI model that you place on the market for downstream use by third parties?"
- Yes → gpai_flag = true; continue to risk category
- No → gpai_flag = false; continue to risk category

GPAI flag combines with risk category, does not replace it.
A system can be both GPAI and High-risk simultaneously.

### Risk category — decision tree

```
P1: Does your system make or directly influence decisions
    that affect natural persons?
    → No  → Minimal risk (end)
    → Yes → P2

P2: Is the system used in: employment, education, healthcare,
    justice, critical infrastructure, migration, biometrics,
    or access to essential services?
    → No  → P3
    → Yes → P4

P3: Does the system generate content or interact with users
    in a way that could mislead them about the nature of
    the interaction?
    → No  → Minimal risk (end)
    → Yes → Limited risk (end)

P4: Is the system a safety component of a product regulated
    by EU product safety law (medical devices, vehicles,
    aviation, etc.)?
    → Yes → High-risk (Annex I) (end)
    → No  → High-risk (Annex III) (end)
```

System displays suggested category with explanation of why.
User may override with acknowledgment: "You are overriding the suggested
classification. Responsibility for incorrect classification rests with you."

Profile = { role, gpai_flag, risk_category, deployment_status }
Profile filters the knowledge base before rendering any form sections.

---

## Step 3: Metric input form

Every section has subtitle:
"This section helps identify potential gaps relative to [framework] requirements.
Thresholds shown are GapSight industry defaults, not regulatory requirements."

Every threshold value has inline label:
"GapSight default — not a regulatory requirement"

### Section 1: Accuracy & Performance

Fields:
- overall_accuracy: float [0, 1]
- f1_score: float [0, 1]
- auc_roc: float [0, 1]
- test_set_size: integer > 0
- test_set_representative: enum [yes, partial, no]

Validation:
- Values outside [0,1]: reject with message
- test_set_size < 100: warning "Metrics may not be reliable with small test sets"
- test_set_size < 30: auto-set context_flag SMALL_TEST_SET → all accuracy metrics get REVIEW regardless of value
- test_set_representative == partial or no: context_flag UNREPRESENTATIVE_TEST_SET → auto REVIEW

Thresholds:
- accuracy: pass ≥ 0.80, review ≥ 0.65, fail < 0.65
- f1_score: pass ≥ 0.75, review ≥ 0.60, fail < 0.60
- auc_roc: pass ≥ 0.80, review ≥ 0.65, fail < 0.65

Tooltip for each field: definition, how to calculate, recommended tool (sklearn.metrics), why relevant.

---

### Section 2: Fairness & Bias

Hard blocker for high-risk systems: if user attempts to skip,
block with message: "EU AI Act Article 10 requires bias detection for
high-risk systems. This section is mandatory for your profile."

Fields:
- demographic_parity_diff: float [-1, 1]
- equalized_odds_diff: float [-1, 1]
- disparate_impact_ratio: float [0, ∞)
- protected_attributes_tested: multi-select [gender, race, age, disability, religion, other]
- bias_mitigation_applied: boolean
- bias_mitigation_method: text (shown if bias_mitigation_applied == true)

If user has no fairness metrics: show "How to get these metrics" panel
with links to Fairlearn and AIF360. Button "I have not calculated these metrics"
→ sets all fairness fields to NOT_PROVIDED_REQUIRED → generates automatic FAIL.

Thresholds:
- demographic_parity_diff: pass ≤ 0.05, review ≤ 0.10, fail > 0.10 (lower is better)
- equalized_odds_diff: pass ≤ 0.05, review ≤ 0.10, fail > 0.10 (lower is better)
- disparate_impact_ratio: pass ≥ 0.80, review ≥ 0.60, fail < 0.60

---

### Section 3: Robustness, Drift & Cybersecurity

Fields:
- data_drift_score: float [0, 1] (lower is better)
- concept_drift_score: float [0, 1] (lower is better)
- adversarial_robustness_score: float [0, 1]
- drift_monitoring_active: boolean
- failsafe_mechanism_documented: boolean
- last_retrain_date: date

Validation:
- post-deployment + drift_monitoring_active == false → context_flag NO_PROD_MONITORING → CRITICAL action item
- last_retrain_date > 12 months ago → auto REVIEW on drift metrics
- last_retrain_date > 24 months ago → auto FAIL on drift metrics

Thresholds:
- data_drift_score: pass ≤ 0.10, review ≤ 0.20, fail > 0.20
- concept_drift_score: pass ≤ 0.10, review ≤ 0.20, fail > 0.20
- adversarial_robustness_score: pass ≥ 0.70, review ≥ 0.50, fail < 0.50

---

### Section 4: Explainability & Transparency

Fields:
- explainability_method: enum [SHAP, LIME, Integrated Gradients, Feature Importance, None]
- explanation_coverage: float [0, 1]
- explanations_available_to_users: boolean
- model_card_exists: boolean
- instructions_for_use_documented: boolean

Validation:
- explainability_method == None → all explainability items = FAIL
- model_card_exists == false → show links to Google Model Cards template and HuggingFace template
- instructions_for_use_documented == false AND high-risk → CRITICAL action item "required before deployment"

Thresholds:
- explanation_coverage: pass ≥ 0.90, review ≥ 0.70, fail < 0.70

---

### Section 5: Human Oversight — weighted questionnaire

| # | Question | Weight | Hard blocker |
|---|----------|--------|--------------|
| 1 | Can operators understand outputs and limitations? | 1x | No |
| 2 | Is there an override or stop mechanism? | 3x | YES |
| 3 | Have operators completed training? | 2x | No |
| 4 | Are escalation procedures documented? | 2x | No |
| 5 | Does system actively prevent automation bias? | 1x | No |

Answers: yes=1, partially=0.5, no=0

Scoring logic:
```
if question_2 == "no":
    status = CRITICAL_FAIL
    message = "EU AI Act Article 14: override mechanism is non-negotiable
               for high-risk systems. Deployment is not possible without
               this functionality."
else:
    weighted_score = (q1*1 + q2*3 + q3*2 + q4*2 + q5*1) / (1+3+2+2+1)
    if weighted_score >= 0.80: PASS
    elif weighted_score >= 0.60: REVIEW
    else: FAIL
```

---

### Section 6: GPAI obligations (shown only if gpai_flag == true)

Fields:
- training_flops: scientific notation float (e.g. 1e24)
- training_data_summary_published: enum [yes, in_progress, no]
- copyright_policy_status: enum [yes, in_progress, no]
- model_evaluations_conducted: boolean
- adversarial_testing_conducted: boolean
- systemic_risk_notification_sent: enum [yes, no, not_applicable]

GPAI systemic risk logic:
```
if training_flops >= 1e25:
    systemic_risk_flag = true
    show warning: "Your model exceeds the GPAI systemic risk threshold
                   (10^25 FLOPs). Additional obligations apply from
                   2 Aug 2025: model evaluations, adversarial testing,
                   incident reporting, cybersecurity measures,
                   notification to EU AI Office."
    if systemic_risk_notification_sent == "no":
        generate CRITICAL action item
```

Copyright policy checklist (shown if copyright_policy_status != "yes"):
```
□ List of training data sources with licenses
□ Opt-out mechanism for rights holders
□ DMCA/copyright takedown procedure
□ Policy on generated content and copyright liability
```
Status + completion date (if in_progress) + evidence description (min 20 chars).
If "no": link to EU AI Office Copyright Guidelines.

---

### Section 7: Governance — structured self-attestation

Each item has: status + completion_date (if in_progress) + evidence_description (min 20 chars if yes/in_progress).

Items:
- risk_management_system: enum [yes, in_progress, no]
- ai_policy: enum [yes, in_progress, no]
- technical_documentation: enum [yes, partial, no]
- data_governance_policy: enum [yes, in_progress, no]
- automated_logging: enum [yes, no]
- quality_management_system: enum [yes, in_progress, no]
- third_party_vendor_assessment: enum [yes, no, not_applicable]

Technical Documentation special case (if partial):
Show Annex IV element checklist (15 items). Each unchecked item generates
its own action item. Items:
1. General system description
2. Provider identity and contact
3. System version and update history
4. Hardware/software requirements
5. System architecture description
6. Data sources and governance
7. Data pre-processing procedures
8. Bias detection and mitigation
9. Validation methodology
10. Testing metrics (accuracy, robustness)
11. Cybersecurity measures
12. Human oversight arrangements
13. Post-market monitoring plan
14. Risk management description
15. EU Declaration of Conformity

---

## Step 4: Cross-metric validation engine

Runs after all inputs collected, before generating results.
Rules are in `/config/cross-metric-rules.json`.

```
RULE 1 — Accuracy-Fairness Tradeoff
IF overall_accuracy >= 0.90
AND demographic_parity_diff >= 0.15
THEN WARNING: "High accuracy with significant fairness gap detected.
EU AI Act Article 10 and NIST MEASURE 2.11 require explicit analysis
and documentation of this tradeoff."

RULE 2 — Robustness Without Monitoring
IF adversarial_robustness_score >= 0.80
AND drift_monitoring_active == false
THEN WARNING: "Robustness measured during development does not guarantee
runtime robustness without active production monitoring."

RULE 3 — High Drift Without Retraining
IF data_drift_score >= 0.20
AND months_since_retrain >= 12
THEN CRITICAL: "High drift score combined with stale model requires
immediate retraining plan."

RULE 4 — Fairness Without Mitigation
IF equalized_odds_diff >= 0.10
AND bias_mitigation_applied == false
THEN CRITICAL: "Bias detected without applied mitigation.
Direct EU AI Act Article 10 violation."

RULE 5 — Explainability-Oversight Gap
IF explainability_method == "None"
AND human_oversight_weighted_score < 0.80
THEN WARNING: "Absence of explainability combined with weak human oversight
increases automation bias risk."

RULE 6 — GPAI Systemic Risk Notification
IF gpai_flag == true
AND training_flops >= 1e25
AND systemic_risk_notification_sent == "no"
THEN CRITICAL: "GPAI systemic risk threshold exceeded.
Notification to EU AI Office is mandatory immediately."

RULE 7 — High-Risk Post-Deployment Without Logging
IF risk_category == "high-risk"
AND deployment_status == "post-deployment"
AND automated_logging == "no"
THEN CRITICAL: "EU AI Act Article 12 requires automated logging
for high-risk systems in production."
```

Cross-metric warnings panel displayed above summary, grouped by severity:
- CRITICAL (red, ⛔)
- WARNING (yellow, ⚠)
- INFO (blue, ℹ)

---

## Step 5: Status logic per metric

```javascript
function getStatus(value, metric, context_flags, profile) {
  // Hard blockers first
  if (context_flags.includes('CRITICAL_FAIL')) return 'CRITICAL_FAIL';

  // Not provided
  if (value === null || value === undefined) {
    if (isRequiredForProfile(metric, profile)) return 'FAIL';
    else return 'NOT_APPLICABLE';
  }

  // Context flag overrides
  if (context_flags.includes('SMALL_TEST_SET') &&
      metric.section === 'accuracy') return 'REVIEW';
  if (context_flags.includes('UNREPRESENTATIVE_TEST_SET') &&
      metric.section === 'accuracy') return 'REVIEW';
  if (context_flags.includes('NO_PROD_MONITORING') &&
      metric.section === 'drift') return 'PROCESS_REQUIRED';

  // Numeric thresholds
  const dir = metric.direction; // 'higher_better' or 'lower_better'
  if (dir === 'higher_better') {
    if (value >= metric.pass_threshold) return 'PASS';
    if (value >= metric.review_threshold) return 'REVIEW';
    return 'FAIL';
  } else {
    if (value <= metric.pass_threshold) return 'PASS';
    if (value <= metric.review_threshold) return 'REVIEW';
    return 'FAIL';
  }
}
```

---

## Step 6: Risk level calibration

```javascript
function getRiskLevel(results) {
  const required = results.filter(r => r.required_for_profile);
  const total = required.length;
  const critical = required.filter(r => r.status === 'CRITICAL_FAIL').length;
  const failed = required.filter(r => r.status === 'FAIL').length;
  const reviewed = required.filter(r => r.status === 'REVIEW').length;
  const crossCritical = crossMetricWarnings.filter(w => w.severity === 'CRITICAL').length;

  if (critical >= 1) return {
    level: 'CRITICAL',
    message: 'Deployment is not permitted until critical issues are resolved.'
  };

  const failRate = failed / total;
  if (failRate >= 0.30 || crossCritical >= 2) return {
    level: 'HIGH',
    message: 'Significant compliance gaps identified. Address before deployment. Consult a qualified legal professional.'
  };

  const reviewRate = reviewed / total;
  if (failRate < 0.30 && reviewRate >= 0.20) return {
    level: 'MEDIUM',
    message: 'Some areas require attention. A review with a compliance professional is recommended.'
  };

  return {
    level: 'LOW',
    message: 'Profile shows a good baseline. Periodic reassessment is recommended.'
  };
}
```

Criteria displayed to user via "How is this calculated?" modal link in summary panel.

---

## Step 7: Action items

Grouped by urgency:

**CRITICAL — before deployment / immediately**
Each item includes: what to do, which document must exist,
estimated time, relevant framework reference.

**HIGH PRIORITY — within 30 days**
REVIEW items with deadline.

**MEDIUM PRIORITY — within 90 days**
In-progress governance items with their stated completion dates.

**ONGOING**
Monitoring and maintenance obligations.

---

## Step 8: Summary panel structure

```
ASSESSMENT SUMMARY
Profile: [role] | [risk_category] | [gpai if true] | [deployment_status]
Generated: [timestamp] | KB v1.0 | Mar 2026
Thresholds: GapSight defaults, not regulatory requirements

[⛔ N Critical Issues] [visible if critical > 0]

EU AI Act:   X/Y PASS   N REVIEW   N FAIL   [N CRITICAL]
NIST RMF:    X/Y PASS   N REVIEW   N FAIL
ISO 42001:   X/Y PASS   N REVIEW   N FAIL

Overall Risk Level: [CRITICAL | HIGH | MEDIUM | LOW]
→ [one sentence context message]
   [How is this calculated? ↗] → opens modal
```
