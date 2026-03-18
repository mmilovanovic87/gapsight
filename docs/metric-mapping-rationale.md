# GapSight Metric-to-Regulation Mapping Rationale

## Overview

GapSight maps ML evaluation metrics to regulatory requirements across EU AI Act (Regulation EU 2024/1689), NIST AI RMF (2023), and ISO/IEC 42001:2023. This document explains the rationale for each mapping based on the text of the relevant articles and standards. Every threshold value used by GapSight is a domain benchmark across comparable systems and does not carry regulatory authority.

---

## EU AI Act Mappings

### Overall Accuracy
- **Why it matters for compliance:** Article 15(1) requires high-risk AI systems to achieve "an appropriate level of accuracy" in light of their intended purpose. Accuracy is the most direct measure of whether a system performs its intended function correctly.
- **Primary regulatory reference:** Article 15 — Accuracy, robustness and cybersecurity
- **Secondary references:** Annex IV(2)(b) — technical documentation must include "metrics used to measure accuracy"
- **Scoring rationale:** Pass threshold 0.80 and review threshold 0.65 are based on domain benchmarks across comparable systems for binary and multi-class classification tasks.

### F1 Score (weighted)
- **Why it matters for compliance:** Article 15 requires accuracy metrics appropriate to the system's purpose. F1 Score captures precision-recall tradeoffs, which is essential for systems where false positives and false negatives have different consequences — a common scenario in high-risk use cases.
- **Primary regulatory reference:** Article 15 — Accuracy, robustness and cybersecurity
- **Secondary references:** Annex IV(2)(b) — validation and testing metrics documentation
- **Scoring rationale:** Pass threshold 0.75 and review threshold 0.60 are based on domain benchmarks across comparable systems, reflecting that F1 is typically lower than raw accuracy for imbalanced datasets.

### AUC-ROC
- **Why it matters for compliance:** AUC-ROC measures discriminative ability across all classification thresholds, providing a threshold-independent view of model quality. Article 15 requires metrics that reflect the system's overall performance characteristics, not just a single operating point.
- **Primary regulatory reference:** Article 15 — Accuracy, robustness and cybersecurity
- **Secondary references:** Annex IV(2)(b); NIST MEASURE 2.3, MEASURE 2.5
- **Scoring rationale:** Pass threshold 0.80 and review threshold 0.65 are based on domain benchmarks across comparable systems.

### Demographic Parity Difference
- **Why it matters for compliance:** Article 10(2)(f) requires that training data be "examined in view of possible biases that are likely to affect the health and safety of persons." Demographic parity difference measures whether positive prediction rates differ across protected groups — a direct indicator of potential discriminatory impact.
- **Primary regulatory reference:** Article 10 — Data and data governance
- **Secondary references:** Annex IV(2)(f) — bias examination; NIST MEASURE 2.11 — fairness evaluation
- **Scoring rationale:** Pass threshold 0.05 and review threshold 0.10 are based on domain benchmarks across comparable systems and the four-fifths rule commonly referenced in anti-discrimination analysis.

### Equalized Odds Difference
- **Why it matters for compliance:** Equalized odds measures whether error rates (false positive and true positive) differ across groups. Article 10 and Article 13 require both bias detection and transparency about system limitations, including differential error patterns.
- **Primary regulatory reference:** Article 10 — Data and data governance
- **Secondary references:** Article 13 — Transparency and provision of information; Annex IV(2)(f)
- **Scoring rationale:** Pass threshold 0.05 and review threshold 0.10 are based on domain benchmarks across comparable systems.

### Disparate Impact Ratio
- **Why it matters for compliance:** The disparate impact ratio measures the ratio of positive outcomes between protected and reference groups. Values below 0.80 (the "four-fifths rule") are widely considered evidence of adverse impact. Article 10 requires providers to examine data for biases.
- **Primary regulatory reference:** Article 10 — Data and data governance
- **Secondary references:** NIST MEASURE 2.11
- **Scoring rationale:** Pass threshold 0.80 and review threshold 0.60 are based on domain benchmarks across comparable systems and the established four-fifths rule in disparate impact analysis.

### Data Drift Score
- **Why it matters for compliance:** Article 15(4) requires high-risk AI systems to be "resilient as regards errors, faults or inconsistencies that may occur within the system or the environment." Data drift indicates that the production data distribution has diverged from training data, which may degrade system reliability. Article 12 requires record-keeping of performance changes.
- **Primary regulatory reference:** Article 15 — Accuracy, robustness and cybersecurity
- **Secondary references:** Article 12 — Record-keeping; NIST MEASURE 3.1 — system monitoring
- **Scoring rationale:** Pass threshold 0.10 and review threshold 0.20 are based on domain benchmarks across comparable systems for statistical distance measures (PSI, KL divergence).

### Concept Drift Score
- **Why it matters for compliance:** Concept drift occurs when the relationship between inputs and outputs changes over time. Article 15 requires systems to maintain their intended level of performance throughout their lifecycle, which is directly threatened by concept drift.
- **Primary regulatory reference:** Article 15 — Accuracy, robustness and cybersecurity
- **Secondary references:** NIST MEASURE 3.1, MEASURE 3.3
- **Scoring rationale:** Pass threshold 0.10 and review threshold 0.20 are based on domain benchmarks across comparable systems.

### Adversarial Robustness Score
- **Why it matters for compliance:** Article 15(4) explicitly requires that high-risk AI systems be "resilient regarding attempts by unauthorised third parties to alter their use, outputs or performance by exploiting the system vulnerabilities." Adversarial robustness directly measures this resilience.
- **Primary regulatory reference:** Article 15 — Accuracy, robustness and cybersecurity
- **Secondary references:** NIST MEASURE 2.7, MEASURE 2.9 — robustness and security evaluation
- **Scoring rationale:** Pass threshold 0.70 and review threshold 0.50 are based on domain benchmarks across comparable systems for adversarial attack evaluation.

### Explanation Coverage
- **Why it matters for compliance:** Article 13(1) requires that high-risk AI systems "be designed and developed in such a way as to ensure that their operation is sufficiently transparent to enable deployers to interpret a system's output and use it appropriately." Explanation coverage measures the proportion of predictions for which interpretable explanations are available.
- **Primary regulatory reference:** Article 13 — Transparency and provision of information to deployers
- **Secondary references:** Article 14 — Human oversight; Annex IV(2)(b); NIST MEASURE 2.5, MEASURE 2.6
- **Scoring rationale:** Pass threshold 0.90 and review threshold 0.70 are based on domain benchmarks across comparable systems for SHAP/LIME coverage rates.

---

## NIST AI RMF Mappings

GapSight maps metrics to NIST AI RMF's four functions:

| Function | Relevant Metrics |
|----------|-----------------|
| **GOVERN** | Governance process requirements (risk management system, AI policy, quality management) |
| **MAP** | Risk management system, deployment context assessment |
| **MEASURE** | All quantitative metrics (accuracy, fairness, robustness, explainability, drift monitoring) |
| **MANAGE** | Quality management, third-party vendor assessment, automated logging |

Key subcategory mappings:
- MEASURE 2.1, 2.3 — Accuracy and performance (accuracy, F1, AUC-ROC)
- MEASURE 2.11 — Fairness and bias (demographic parity, equalized odds, disparate impact)
- MEASURE 2.5, 2.6 — Explainability (explanation coverage)
- MEASURE 2.7, 2.9 — Robustness (adversarial robustness)
- MEASURE 3.1, 3.2, 3.3 — Monitoring (data drift, concept drift)

---

## ISO/IEC 42001 Mappings

GapSight maps to relevant ISO/IEC 42001:2023 clauses:

| Clause / Annex | Relevant Metrics |
|----------------|-----------------|
| **Clause 6** (Planning) | Risk management system |
| **Clause 8** (Operation) | All operational metrics |
| **Clause 9** (Performance evaluation) | Accuracy, drift scores |
| **Clauses 9-10** (Improvement) | Quality management system |
| **Annex A.5.5** | Accuracy, F1, AUC-ROC, fairness metrics |
| **Annex A.5.7** | Data drift, concept drift, robustness |
| **Annex A.5.8** | Explanation coverage, technical documentation |
| **Annex A.6.4** | Fairness and bias metrics |
| **Annex A.7** | Technical documentation |
| **Annex A.9** | Third-party and supply chain management |

---

## Governance Process Mappings

| Process Requirement | EU AI Act | NIST AI RMF | ISO 42001 |
|-------------------|-----------|-------------|-----------|
| Risk Management System | Article 9 | MAP, MANAGE | Clause 6, Annex A.5 |
| AI Governance Policy | Articles 16-17 | GOVERN 1.2, GOVERN 2 | Clause 5, Annex A.2 |
| Technical Documentation | Article 11, Annex IV | GOVERN 1.1, GOVERN 5 | Annex A.5.8, Annex A.7 |
| Data Governance Policy | Article 10 | MEASURE 2.10 | Annex A.6 |
| Automated Logging | Article 12 | MEASURE 3.2 | Annex A.5.7, Annex A.7.2 |
| Quality Management System | Article 17 | MANAGE 4 | Clauses 9-10 |
| Third-Party Vendor Assessment | Article 25 | GOVERN 6, MANAGE 3 | Annex A.9 |

---

## Limitations

This mapping is indicative and based on the authors' interpretation of the regulatory text. It does not constitute legal advice. The EU AI Act implementing acts and technical standards (CEN/CENELEC) may specify additional or different requirements. Organizations should consult qualified legal counsel and monitor the development of harmonised standards under the EU AI Act for definitive compliance guidance.
