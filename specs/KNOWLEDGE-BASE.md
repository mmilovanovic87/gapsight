# GapSight — Knowledge Base Specification
### AI regulatory self-assessment for ML teams.

## Structure of knowledge-base.json

```json
{
  "kb_version": "1.0",
  "kb_date": "2026-03",
  "metrics": [ ...metric objects ],
  "process_requirements": [ ...process objects ],
  "cross_metric_rules": [ ...rule objects ],
  "annex_iv_elements": [ ...15 element objects ],
  "gpai_copyright_checklist": [ ...4 item objects ],
  "risk_level_criteria": { ...thresholds },
  "compliance_deadlines": { ...dates }
}
```

---

## Metric object schema

```json
{
  "id": "accuracy",
  "label": "Overall Accuracy",
  "section": "accuracy_performance",
  "input_type": "float",
  "input_range": [0, 1],
  "direction": "higher_better",
  "pass_threshold": 0.80,
  "review_threshold": 0.65,
  "threshold_note": "GapSight industry default — not a regulatory requirement",
  "required_for_profiles": {
    "risk_categories": ["high-risk", "limited", "gpai"],
    "roles": ["provider", "both"],
    "deployment_statuses": ["pre-deployment", "post-deployment", "pilot"]
  },
  "framework_mappings": [
    {
      "framework": "eu_ai_act",
      "reference": "Article 15",
      "description": "Accuracy, robustness and cybersecurity"
    },
    {
      "framework": "nist_ai_rmf",
      "reference": "MEASURE 2.1, MEASURE 2.3",
      "description": "AI system performance metrics"
    },
    {
      "framework": "iso_42001",
      "reference": "Clause 9, Annex A.5.5",
      "description": "Performance evaluation and validation"
    }
  ],
  "evidence_required": "Test set results with accuracy score and test set description",
  "tooltip": "Proportion of correct predictions over total predictions.",
  "calculation_guide": "sklearn.metrics.accuracy_score(y_true, y_pred)",
  "tool_link": "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.accuracy_score.html"
}
```

---

## All metrics — v1.0

### Section 1: Accuracy & Performance

| id | label | direction | pass | review | frameworks |
|----|-------|-----------|------|--------|------------|
| accuracy | Overall Accuracy | higher | ≥0.80 | ≥0.65 | EU Art.15, NIST M2.1/2.3, ISO Cl.9/A.5.5 |
| f1_score | F1 Score (weighted) | higher | ≥0.75 | ≥0.60 | EU Art.15, NIST M2.1, ISO A.5.5 |
| auc_roc | AUC-ROC | higher | ≥0.80 | ≥0.65 | EU Art.15, NIST M2.3, ISO A.5.5 |

Context flags that override numeric thresholds:
- SMALL_TEST_SET (size < 30): forces REVIEW
- UNREPRESENTATIVE_TEST_SET: forces REVIEW

### Section 2: Fairness & Bias

| id | label | direction | pass | review | frameworks |
|----|-------|-----------|------|--------|------------|
| demographic_parity_diff | Demographic Parity Difference | lower | ≤0.05 | ≤0.10 | EU Art.10/Annex IV, NIST M2.11, ISO A.6.4/A.5.5 |
| equalized_odds_diff | Equalized Odds Difference | lower | ≤0.05 | ≤0.10 | EU Art.10, NIST M2.11, ISO A.6.4 |
| disparate_impact_ratio | Disparate Impact Ratio | higher | ≥0.80 | ≥0.60 | EU Art.10, NIST M2.11, ISO A.6.4 |

Tools: Fairlearn (https://fairlearn.org), AIF360 (https://aif360.mybluemix.net)

### Section 3: Robustness, Drift & Cybersecurity

| id | label | direction | pass | review | frameworks |
|----|-------|-----------|------|--------|------------|
| data_drift_score | Data Drift Score | lower | ≤0.10 | ≤0.20 | EU Art.15, NIST M3.1/3.2, ISO A.5.7 |
| concept_drift_score | Concept Drift Score | lower | ≤0.10 | ≤0.20 | EU Art.15, NIST M3.3, ISO A.5.7 |
| adversarial_robustness_score | Adversarial Robustness Score | higher | ≥0.70 | ≥0.50 | EU Art.15, NIST M2.2, ISO A.5.7 |

Tool for adversarial robustness: IBM ART (https://github.com/Trusted-AI/adversarial-robustness-toolbox)

### Section 4: Explainability & Transparency

| id | label | direction | pass | review | frameworks |
|----|-------|-----------|------|--------|------------|
| explanation_coverage | Explanation Coverage (SHAP/LIME) | higher | ≥0.90 | ≥0.70 | EU Art.13, NIST M2.5/2.6, ISO A.5.8/A.7.3 |

Boolean fields (not numeric, generate PASS/FAIL):
- explanations_available_to_users → EU Art.13, NIST M2.6, ISO A.7.3
- model_card_exists → EU Art.11, NIST GOVERN 1.1, ISO A.5.1
- instructions_for_use_documented → EU Art.13 (mandatory high-risk)

### Section 5: Human Oversight

Weighted questionnaire — see ALGORITHM.md Step 3 Section 5.
Framework: EU Art.14, NIST M2.7, ISO A.5.6/A.5.7

### Section 6: GPAI (conditional)

Framework references: EU Art.51-55, EU AI Office guidelines
Systemic risk threshold: 10^25 FLOPs per EU AI Act Article 51

---

## Process requirements — Section 7

These are self-attested, not metric-based. Each generates PROCESS_REQUIRED status.

| id | label | frameworks | if_no_guidance |
|----|-------|------------|----------------|
| risk_management_system | Risk Management System | EU Art.9, NIST MAP/MANAGE, ISO Cl.6 | Template link + "2-4 business days" |
| ai_policy | AI Policy | EU Art.9, NIST GOVERN 1.2, ISO Cl.5 | Template link |
| technical_documentation | Technical Documentation (Annex IV) | EU Art.11, Annex IV | 15-element checklist |
| data_governance_policy | Data Governance Policy | EU Art.10, NIST M2.10, ISO A.6 | Template link |
| automated_logging | Automated Logging | EU Art.12, NIST M3.2, ISO A.5.7 | Critical if post-deployment |
| quality_management_system | Quality Management System | EU Art.17, ISO Cl.10 | Note: micro-enterprise simplified QMS available |
| third_party_vendor_assessment | Third-Party Vendor Assessment | EU Art.25, NIST GOVERN 6, ISO A.8 | N/A option available |

---

## Annex IV elements (15 items)

Used in technical_documentation partial checklist.

1. General system description
2. Provider identity and contact information
3. System version and update history
4. Hardware and software requirements
5. System architecture description
6. Data sources and governance procedures
7. Data pre-processing procedures
8. Bias detection and mitigation procedures
9. Validation methodology
10. Testing metrics (accuracy, robustness, etc.)
11. Cybersecurity measures
12. Human oversight arrangements
13. Post-market monitoring plan
14. Risk management system description
15. EU Declaration of Conformity

Each unchecked element generates its own action item.

---

## GPAI copyright policy checklist (4 items)

1. List of training data sources with licenses
2. Opt-out mechanism for rights holders
3. DMCA/copyright takedown procedure
4. Policy on AI-generated content and copyright liability

Reference: EU AI Act Article 53(1)(c)

---

## Compliance deadlines

```json
{
  "eu_ai_act": {
    "prohibited_practices": "2025-02-02",
    "gpai_obligations": "2025-08-02",
    "high_risk_requirements": "2026-08-02",
    "regulated_products_transition": "2027-08-02"
  }
}
```

---

## Cross-framework mapping summary

| Topic | EU AI Act | NIST AI RMF | ISO 42001 |
|-------|-----------|-------------|-----------|
| Accuracy & Performance | Art. 15 | MEASURE 2.1, 2.3 | Clause 9, A.5.5 |
| Fairness & Bias | Art. 10, Annex IV | MEASURE 2.11 | A.6.4, A.5.5 |
| Robustness & Drift | Art. 15 | MEASURE 2.2, 3.1-3.3 | A.5.7 |
| Explainability | Art. 13 | MEASURE 2.5, 2.6 | A.5.8, A.7.3 |
| Human Oversight | Art. 14 | MEASURE 2.7 | A.5.6, A.5.7 |
| Data Governance | Art. 10 | MEASURE 2.10 | A.6 |
| Risk Management | Art. 9 | MAP, MANAGE | Clause 6, A.5 |
| Technical Docs | Art. 11, Annex IV | GOVERN 1.1 | A.5.1 |
| Logging | Art. 12 | MEASURE 3.2 | A.5.7 |
| Quality Management | Art. 17 | — | Clause 10 |
| Third-Party | Art. 25 | GOVERN 6 | A.8 |

---

## Updating the knowledge base

1. Determine if change is breaking per ARCHITECTURE.md Section 2 criteria
2. Update `src/data/knowledge-base.json`
3. Update `public/kb-changelog.json` with new version entry
4. If breaking: set `breaking_changes: true` in changelog entry
5. Bump `kb_version` string in both files
6. Update `CLAUDE.md` current KB version line
7. Set `next_review` date in changelog entry
8. Run full test suite before deploy
