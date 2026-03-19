/**
 * Centralized constants for all scoring, validation, and display logic.
 *
 * Scoring constants are duplicated from gapsight-core/constants.js.
 * UI-only constants (validation, timing, styling) are defined here.
 *
 * @module constants
 */

// NOTE: These constants are intentionally duplicated from gapsight-core/constants.js.
// gapsight-core is a CommonJS Node.js module and cannot be imported in browser ESM code.
// If you change a value here, you MUST also update gapsight-core/constants.js (and vice versa).

// ---------------------------------------------------------------------------
// Scoring constants — duplicated from gapsight-core/constants.js
// ---------------------------------------------------------------------------

/** @type {number[]} Weights for human oversight questions q1–q5. */
export const OVERSIGHT_WEIGHTS = [1, 3, 2, 2, 1];

/** Minimum weighted score for a PASS on human oversight. */
export const OVERSIGHT_PASS_THRESHOLD = 0.80;

/** Minimum weighted score for a REVIEW on human oversight. */
export const OVERSIGHT_REVIEW_THRESHOLD = 0.60;

/** Test sets below this sample count trigger SMALL_TEST_SET flag. */
export const SMALL_TEST_SET_THRESHOLD = 30;

/** Months since last retrain to trigger STALE_MODEL_24M flag. */
export const STALE_MODEL_24M_MONTHS = 24;

/** Months since last retrain to trigger STALE_MODEL_12M flag. */
export const STALE_MODEL_12M_MONTHS = 12;

/** Accuracy above this combined with fairness gap triggers Rule 1 warning. */
export const CROSS_ACCURACY_THRESHOLD = 0.90;

/** Demographic parity diff above this combined with high accuracy triggers Rule 1. */
export const CROSS_FAIRNESS_GAP_THRESHOLD = 0.15;

/** Adversarial robustness above this without monitoring triggers Rule 2 warning. */
export const CROSS_ROBUSTNESS_THRESHOLD = 0.80;

/** Data drift score above this with stale model triggers Rule 3 critical. */
export const CROSS_DRIFT_THRESHOLD = 0.20;

/** Months since retrain above this with high drift triggers Rule 3. */
export const CROSS_RETRAIN_MONTHS_THRESHOLD = 12;

/** Equalized odds diff above this without mitigation triggers Rule 4 critical. */
export const CROSS_FAIRNESS_MITIGATION_THRESHOLD = 0.10;

/** Human oversight score below this with no explainability triggers Rule 5. */
export const CROSS_OVERSIGHT_THRESHOLD = 0.80;

/** Training FLOPS above this triggers GPAI systemic risk notification (Rule 6). */
export const GPAI_SYSTEMIC_RISK_FLOPS = 1e25;

/** Fail rate at or above this percentage results in HIGH risk level. */
export const RISK_FAIL_RATE_THRESHOLD = 0.30;

/** Review rate at or above this percentage results in MEDIUM risk level. */
export const RISK_REVIEW_RATE_THRESHOLD = 0.20;

/** Number of cross-metric CRITICAL warnings that results in HIGH risk level. */
export const RISK_CROSS_CRITICAL_THRESHOLD = 2;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** Minimum character length for bias mitigation method description. */
export const BIAS_MITIGATION_MIN_LENGTH = 20;

/** Minimum character length for feedback description. */
export const FEEDBACK_MIN_LENGTH = 20;

/** Minimum number of framework answers required to advance. */
export const MIN_FRAMEWORK_ANSWERS = 5;

/** Timeout in milliseconds for feedback form submission. */
export const FEEDBACK_TIMEOUT_MS = 10_000;

/** Cooldown in milliseconds after feedback submission before re-enabling button. */
export const FEEDBACK_COOLDOWN_MS = 30_000;

// ---------------------------------------------------------------------------
// Debounce / Timing
// ---------------------------------------------------------------------------

/** Debounce interval in ms for saving assessment inputs to localStorage. */
export const INPUTS_DEBOUNCE_MS = 500;

// ---------------------------------------------------------------------------
// localStorage Keys
// ---------------------------------------------------------------------------

/** Centralized localStorage key names. Used in App.jsx and useAssessmentStore. */
export const STORAGE_KEYS = {
  PREFIX: 'gapsight_',
  SESSION: 'gapsight_session',
  INPUTS: 'gapsight_inputs',
  PROFILE: 'gapsight_profile',
  DISCLAIMER_SHOWN: 'gapsight_disclaimer_shown',
};

// ---------------------------------------------------------------------------
// PDF Export Dimensions (A4, mm)
// ---------------------------------------------------------------------------

/** A4 page width in mm. */
export const PDF_PAGE_WIDTH = 210;

/** Page margin in mm. */
export const PDF_MARGIN = 20;

/** Content width (page width minus both margins). */
export const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN * 2;

/** Maximum Y position before triggering a page break. */
export const PDF_PAGE_BREAK_Y = 277;

// ---------------------------------------------------------------------------
// Display Constants
// ---------------------------------------------------------------------------

/**
 * Human-readable names for compliance frameworks.
 * Duplicated from gapsight-core/constants.js.
 */
export const FRAMEWORK_NAMES = {
  eu_ai_act: 'EU AI Act',
  nist_ai_rmf: 'NIST RMF',
  iso_42001: 'ISO 42001',
};

/**
 * Tailwind CSS classes for risk level display.
 * Used in ResultsPage and SharedViewPage.
 */
export const RISK_LEVEL_STYLES = {
  CRITICAL: 'text-red-700 border-red-500 bg-red-50',
  HIGH: 'text-orange-700 border-orange-500 bg-orange-50',
  MEDIUM: 'text-yellow-700 border-yellow-500 bg-yellow-50',
  LOW: 'text-green-700 border-green-500 bg-green-50',
};

/**
 * Tailwind CSS classes for metric/process status badges.
 * Used in ResultsPage and SharedViewPage.
 */
export const STATUS_BADGE_STYLES = {
  PASS: 'bg-green-100 text-green-800',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  FAIL: 'bg-red-100 text-red-800',
  CRITICAL_FAIL: 'bg-red-200 text-red-900 font-bold',
  NOT_APPLICABLE: 'bg-blue-50 text-blue-600',
  NOT_PROVIDED: 'bg-gray-100 text-gray-500',
  PROCESS_REQUIRED: 'bg-yellow-100 text-yellow-800',
};

/**
 * Display labels for status badges (some statuses show simplified labels).
 */
export const STATUS_BADGE_LABELS = {
  PASS: 'PASS',
  REVIEW: 'REVIEW',
  FAIL: 'FAIL',
  CRITICAL_FAIL: 'CRITICAL',
  NOT_APPLICABLE: 'Not applicable',
  NOT_PROVIDED: 'Not provided',
  PROCESS_REQUIRED: 'REVIEW',
};

/**
 * Tailwind CSS classes for action item urgency levels.
 * Used in ResultsPage and SharedViewPage.
 */
export const URGENCY_LEVEL_STYLES = {
  CRITICAL: { border: 'border-red-300', bg: 'bg-red-50', text: 'text-red-700' },
  HIGH: { border: 'border-orange-300', bg: 'bg-orange-50', text: 'text-orange-700' },
  MEDIUM: { border: 'border-yellow-300', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  ONGOING: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700' },
};

// ---------------------------------------------------------------------------
// Export Colors (non-Tailwind, used in HTML/PDF exports)
// ---------------------------------------------------------------------------

/** Hex colors for risk levels in HTML export. */
export const RISK_COLORS_HEX = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#ca8a04',
  LOW: '#16a34a',
};

/** RGB arrays for risk levels in PDF export. */
export const RISK_COLORS_RGB = {
  CRITICAL: [220, 38, 38],
  HIGH: [234, 88, 12],
  MEDIUM: [202, 138, 4],
  LOW: [22, 163, 74],
  ONGOING: [37, 99, 235],
};

/** RGB arrays for status text in PDF export. */
export const STATUS_COLORS_RGB = {
  PASS: [22, 101, 52],
  REVIEW: [133, 77, 14],
  FAIL: [153, 27, 27],
  CRITICAL_FAIL: [153, 27, 27],
  NOT_APPLICABLE: [107, 114, 128],
  PROCESS_REQUIRED: [133, 77, 14],
};

/** HTML badge config for status in HTML export. */
export const STATUS_BADGES_HTML = {
  PASS: { bg: '#dcfce7', color: '#166534', label: 'PASS' },
  REVIEW: { bg: '#fef9c3', color: '#854d0e', label: 'REVIEW' },
  FAIL: { bg: '#fee2e2', color: '#991b1b', label: 'FAIL' },
  CRITICAL_FAIL: { bg: '#fee2e2', color: '#991b1b', label: 'CRITICAL' },
  NOT_APPLICABLE: { bg: '#f3f4f6', color: '#6b7280', label: 'N/A' },
  PROCESS_REQUIRED: { bg: '#fef9c3', color: '#854d0e', label: 'REVIEW' },
};

/** Hex colors for urgency levels in HTML export. */
export const URGENCY_COLORS_HEX = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#ca8a04',
  ONGOING: '#2563eb',
};

/** Labels for urgency levels in exports. */
export const URGENCY_LABELS_EXPORT = {
  CRITICAL: 'Critical: Before Deployment',
  HIGH: 'High Priority: Within 30 Days',
  MEDIUM: 'Medium Priority: Within 90 Days',
  ONGOING: 'Ongoing',
};
