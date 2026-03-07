import { useState, useEffect } from 'react';
import en from '../../locales/en.json';

const t = en.assessment.onboarding;

const ROLE_OPTIONS = [
  { value: 'provider', label: t.role_options.provider },
  { value: 'deployer', label: t.role_options.deployer },
  { value: 'both', label: t.role_options.both },
];

const RISK_CATEGORIES = [
  { value: 'minimal', label: t.risk_result_minimal },
  { value: 'limited', label: t.risk_result_limited },
  { value: 'high-risk', label: t.risk_result_high_annex_iii },
];

function runDecisionTree(answers) {
  if (answers.p1 === 'no') return 'minimal';
  if (answers.p1 === 'yes') {
    if (answers.p2 === 'yes') {
      if (answers.p4 === 'yes') return 'high-risk-annex-i';
      if (answers.p4 === 'no') return 'high-risk';
      return null; // waiting for p4
    }
    if (answers.p2 === 'no') {
      if (answers.p3 === 'yes') return 'limited';
      if (answers.p3 === 'no') return 'minimal';
      return null; // waiting for p3
    }
    return null; // waiting for p2
  }
  return null;
}

function riskLabel(cat) {
  if (cat === 'high-risk-annex-i') return t.risk_result_high_annex_i;
  if (cat === 'high-risk') return t.risk_result_high_annex_iii;
  if (cat === 'limited') return t.risk_result_limited;
  if (cat === 'minimal') return t.risk_result_minimal;
  return '';
}

function normalizeRisk(cat) {
  if (cat === 'high-risk-annex-i') return 'high-risk';
  return cat;
}

export default function OnboardingStep({ profile, onProfileChange }) {
  const [treeAnswers, setTreeAnswers] = useState({ p1: null, p2: null, p3: null, p4: null });
  const [suggestedRisk, setSuggestedRisk] = useState(null);
  const [overrideActive, setOverrideActive] = useState(false);

  useEffect(() => {
    const result = runDecisionTree(treeAnswers);
    setSuggestedRisk(result);
    if (result && !overrideActive) {
      onProfileChange({ risk_category: normalizeRisk(result) });
    }
  }, [treeAnswers, overrideActive, onProfileChange]);

  const setTreeAnswer = (key, val) => {
    setTreeAnswers((prev) => {
      const next = { ...prev, [key]: val };
      // Reset downstream answers
      if (key === 'p1') { next.p2 = null; next.p3 = null; next.p4 = null; }
      if (key === 'p2') { next.p3 = null; next.p4 = null; }
      return next;
    });
    setOverrideActive(false);
  };

  const handleOverride = (cat) => {
    setOverrideActive(true);
    onProfileChange({ risk_category: cat });
  };

  const YesNo = ({ questionKey, label }) => (
    <div className="ml-4 mt-3">
      <p className="text-sm text-gray-700 mb-2">{label}</p>
      <div className="flex gap-3">
        {['yes', 'no'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setTreeAnswer(questionKey, v)}
            className={`px-4 py-1.5 rounded text-sm border ${
              treeAnswers[questionKey] === v
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {v === 'yes' ? en.assessment.onboarding.gpai_yes : en.assessment.onboarding.gpai_no}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">{t.title}</h2>

      {/* Role */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">{t.role_label}</h3>
        {ROLE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer text-sm ${
              profile.role === opt.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="role"
              checked={profile.role === opt.value}
              onChange={() => onProfileChange({ role: opt.value })}
              className="text-blue-600"
            />
            {opt.label}
          </label>
        ))}
      </div>

      {/* GPAI check */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">{t.gpai_title}</h3>
        <p className="text-sm text-gray-600">{t.gpai_question}</p>
        <div className="flex gap-3">
          {[true, false].map((val) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => onProfileChange({ gpai_flag: val })}
              className={`px-4 py-2 rounded text-sm border ${
                profile.gpai_flag === val
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {val ? t.gpai_yes : t.gpai_no}
            </button>
          ))}
        </div>
      </div>

      {/* Risk category decision tree */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">{t.risk_title}</h3>
        <p className="text-sm text-gray-500">{t.risk_subtitle}</p>

        <YesNo questionKey="p1" label={t.risk_p1} />

        {treeAnswers.p1 === 'yes' && (
          <YesNo questionKey="p2" label={t.risk_p2} />
        )}

        {treeAnswers.p1 === 'yes' && treeAnswers.p2 === 'no' && (
          <YesNo questionKey="p3" label={t.risk_p3} />
        )}

        {treeAnswers.p1 === 'yes' && treeAnswers.p2 === 'yes' && (
          <YesNo questionKey="p4" label={t.risk_p4} />
        )}

        {suggestedRisk && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              {t.risk_suggested.replace('{category}', riskLabel(suggestedRisk))}
            </p>

            {!overrideActive && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setOverrideActive(true)}
                  className="text-xs text-gray-500 underline hover:text-gray-700"
                >
                  {t.risk_override_label}
                </button>
              </div>
            )}

            {overrideActive && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-amber-700 font-medium">{t.risk_override_warning}</p>
                <div className="flex flex-wrap gap-2">
                  {RISK_CATEGORIES.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleOverride(opt.value)}
                      className={`px-3 py-1.5 rounded text-xs border ${
                        profile.risk_category === opt.value
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
