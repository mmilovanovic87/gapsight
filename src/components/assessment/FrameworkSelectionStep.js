import { useState, useEffect, useCallback } from 'react';
import en from '../../locales/en.json';

const t = en.assessment.frameworks;

const ALL_FRAMEWORKS = ['eu_ai_act', 'nist_ai_rmf', 'iso_42001'];
const FW_LABELS = {
  eu_ai_act: t.fw_eu_ai_act,
  nist_ai_rmf: t.fw_nist_ai_rmf,
  iso_42001: t.fw_iso_42001,
};

/**
 * Runs the 5-question decision tree and returns
 * { frameworks: string[], reasons: Record<string, string>, done: boolean }
 */
function evaluateTree(answers) {
  const frameworks = [];
  const reasons = {};

  // Q1: EU users or EU-registered
  if (answers.q1 === undefined) return { frameworks, reasons, done: false };
  if (answers.q1 === true) {
    frameworks.push('eu_ai_act');
    reasons.eu_ai_act = t.reason_eu_mandatory;
  }

  // Q2: US-based or US-regulated
  if (answers.q2 === undefined) return { frameworks, reasons, done: false };
  if (answers.q2 === true) {
    if (!frameworks.includes('nist_ai_rmf')) frameworks.push('nist_ai_rmf');
    reasons.nist_ai_rmf = t.reason_nist_us;
  }

  // Q3: ISO certification required
  if (answers.q3 === undefined) return { frameworks, reasons, done: false };
  if (answers.q3 === true) {
    if (!frameworks.includes('iso_42001')) frameworks.push('iso_42001');
    reasons.iso_42001 = t.reason_iso;
  }

  // Q4: Global governance framework (only if NIST not already flagged)
  if (answers.q4 === undefined) return { frameworks, reasons, done: false };
  if (answers.q4 === true && !frameworks.includes('nist_ai_rmf')) {
    frameworks.push('nist_ai_rmf');
    reasons.nist_ai_rmf = t.reason_nist_global;
  }

  // Q5: EU expansion plans (only if EU AI Act not already flagged)
  if (answers.q5 === undefined) return { frameworks, reasons, done: false };
  if (answers.q5 === true && !frameworks.includes('eu_ai_act')) {
    frameworks.push('eu_ai_act');
    reasons.eu_ai_act = t.reason_eu_proactive;
  }

  // If nothing flagged after all questions, default to NIST
  if (frameworks.length === 0) {
    frameworks.push('nist_ai_rmf');
    reasons.nist_ai_rmf = t.reason_nist_default;
  }

  return { frameworks, reasons, done: true };
}

const QUESTIONS = [
  { key: 'q1', text: t.q1 },
  { key: 'q2', text: t.q2 },
  { key: 'q3', text: t.q3 },
  { key: 'q4', text: t.q4 },
  { key: 'q5', text: t.q5 },
];

const FW_COLORS = {
  eu_ai_act: 'border-blue-300 bg-blue-50',
  nist_ai_rmf: 'border-emerald-300 bg-emerald-50',
  iso_42001: 'border-violet-300 bg-violet-50',
};

export default function FrameworkSelectionStep({ value, onChange }) {
  const [answers, setAnswers] = useState(value?.frameworks_answers || {});
  // extras: frameworks the user manually added beyond what the tree suggests
  const [extras, setExtras] = useState(() => {
    const saved = value?.frameworks_selected;
    const savedAnswers = value?.frameworks_answers || {};
    if (!saved) return [];
    // Recover extras by diffing saved selection against what tree would suggest
    const { frameworks: wouldSuggest } = evaluateTree(savedAnswers);
    return saved.filter((fw) => !wouldSuggest.includes(fw));
  });

  const { frameworks: suggested, reasons, done } = evaluateTree(answers);

  const currentQ = QUESTIONS.findIndex((q) => answers[q.key] === undefined);

  const handleAnswer = useCallback((key, val) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
    setExtras([]);
  }, []);

  // Effective selection = suggested (locked) + extras (user-added)
  const effectiveSelection = done
    ? [...suggested, ...extras.filter((fw) => !suggested.includes(fw))]
    : [];

  // Propagate to parent
  useEffect(() => {
    if (done && effectiveSelection.length > 0) {
      onChange({
        frameworks_selected: effectiveSelection,
        frameworks_answers: answers,
      });
    }
  }, [done, effectiveSelection.join(','), answers, onChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleExtra = (fw) => {
    // Only non-suggested frameworks can be toggled
    if (suggested.includes(fw)) return;
    setExtras((prev) =>
      prev.includes(fw) ? prev.filter((f) => f !== fw) : [...prev, fw]
    );
  };

  const nonSuggested = ALL_FRAMEWORKS.filter((fw) => !suggested.includes(fw));
  const hasExtras = extras.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {QUESTIONS.map((q, i) => {
          if (i > currentQ && !done) return null;
          const answer = answers[q.key];
          return (
            <div key={q.key} className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-800 mb-3">{q.text}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleAnswer(q.key, true)}
                  className={`px-4 py-1.5 text-sm rounded border transition-colors ${
                    answer === true
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {t.answer_yes}
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer(q.key, false)}
                  className={`px-4 py-1.5 text-sm rounded border transition-colors ${
                    answer === false
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {t.answer_no}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Results */}
      {done && (
        <div className="space-y-4 pt-2">
          <h3 className="text-base font-semibold">{t.results_title}</h3>

          {/* Suggested / locked frameworks */}
          <div className="space-y-3">
            {suggested.map((fw) => (
              <div
                key={fw}
                className={`flex items-start gap-3 p-4 rounded-lg border ${FW_COLORS[fw]}`}
              >
                <span className="mt-0.5 flex-shrink-0 text-gray-400" title={t.locked_tooltip}>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{FW_LABELS[fw]}</span>
                    <span className="text-[10px] text-gray-500 bg-white/60 rounded px-1.5 py-0.5">
                      {t.locked_tooltip}
                    </span>
                  </div>
                  {reasons[fw] && (
                    <p className="text-xs text-gray-600 mt-0.5">{reasons[fw]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Non-suggested frameworks the user can add */}
          {nonSuggested.length > 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-medium text-gray-500">{t.additional_label}</p>
              {nonSuggested.map((fw) => {
                const isAdded = extras.includes(fw);
                return (
                  <label
                    key={fw}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      isAdded
                        ? FW_COLORS[fw]
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isAdded}
                      onChange={() => handleToggleExtra(fw)}
                      className="mt-0.5 rounded text-blue-600"
                    />
                    <span className="text-sm font-semibold">{FW_LABELS[fw]}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* EU extraterritorial note */}
          {effectiveSelection.includes('eu_ai_act') && (
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded p-3">
              {t.eu_extraterritorial_note}
            </p>
          )}

          {/* Override warning when user added extra frameworks */}
          {hasExtras && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
              {t.override_warning}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
