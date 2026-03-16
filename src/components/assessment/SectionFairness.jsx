import { useState } from 'react';
import en from '../../locales/en.json';
import { FloatInput, BooleanToggle, MultiSelect, TextArea, SectionWrapper } from './FormField';

const t = en.assessment;
const sec = t.sections.fairness_bias;

export default function SectionFairness({ inputs, onInput, onInputs, profile, errors, sectionNumber }) {
  const [noMetrics, setNoMetrics] = useState(false);
  const [methodTouched, setMethodTouched] = useState(false);
  const subtitle = t.section_subtitle.replace('{framework}', sec.framework);
  const isHighRisk = profile.risk_category === 'high-risk';

  // Real-time error for bias_mitigation_method: show on blur or from parent (Generate click)
  const methodValue = inputs.bias_mitigation_method;
  const methodLength = methodValue?.length || 0;
  const methodError = methodLength >= 20
    ? null
    : (errors.bias_mitigation_method || (methodTouched && methodLength > 0 && methodLength < 20
      ? t.validation.min_length.replace('{min}', '20')
      : null));

  const handleNoMetrics = () => {
    setNoMetrics(true);
    onInputs({
      demographic_parity_diff: 'NOT_PROVIDED_REQUIRED',
      equalized_odds_diff: 'NOT_PROVIDED_REQUIRED',
      disparate_impact_ratio: 'NOT_PROVIDED_REQUIRED',
    });
  };

  return (
    <SectionWrapper title={sec.title} subtitle={subtitle} sectionNumber={sectionNumber}>
      {isHighRisk && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
          {sec.blocker_message}
        </div>
      )}

      {!noMetrics ? (
        <>
          <FloatInput
            id="demographic_parity_diff"
            label={t.fields.demographic_parity_diff}
            value={inputs.demographic_parity_diff}
            onChange={(v) => onInput('demographic_parity_diff', v)}
            min={-1} max={1}
            direction="lower_better"
            passAt={0.05} reviewAt={0.10}
            tooltip="Difference in positive prediction rates between protected and reference groups. Closer to 0 is better."
            error={errors.demographic_parity_diff}
          />
          <FloatInput
            id="equalized_odds_diff"
            label={t.fields.equalized_odds_diff}
            value={inputs.equalized_odds_diff}
            onChange={(v) => onInput('equalized_odds_diff', v)}
            min={-1} max={1}
            direction="lower_better"
            passAt={0.05} reviewAt={0.10}
            tooltip="Difference in true positive and false positive rates between groups. Closer to 0 is better."
            error={errors.equalized_odds_diff}
          />
          <FloatInput
            id="disparate_impact_ratio"
            label={t.fields.disparate_impact_ratio}
            value={inputs.disparate_impact_ratio}
            onChange={(v) => onInput('disparate_impact_ratio', v)}
            min={0}
            direction="higher_better"
            passAt={0.80} reviewAt={0.60}
            tooltip="Ratio of positive prediction rates between groups. Values closer to 1.0 indicate parity."
            error={errors.disparate_impact_ratio}
          />

          <div className="p-4 bg-gray-50 border border-gray-200 rounded space-y-3">
            <p className="text-sm font-medium text-gray-600">{sec.no_metrics_title}</p>
            <p className="text-sm text-gray-500">{sec.no_metrics_body}</p>
            <div className="flex gap-3 text-xs">
              <a href={sec.fairlearn_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Fairlearn</a>
              <a href={sec.aif360_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">AIF360</a>
            </div>
            <button
              type="button"
              onClick={handleNoMetrics}
              className="text-sm text-red-600 underline hover:text-red-800"
            >
              {sec.no_metrics_button}
            </button>
          </div>
        </>
      ) : (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          All fairness metrics set to NOT_PROVIDED_REQUIRED. This will generate automatic FAIL status.
        </div>
      )}

      <MultiSelect
        id="protected_attributes_tested"
        label={t.fields.protected_attributes_tested}
        options={t.fields.protected_attributes_options}
        value={inputs.protected_attributes_tested}
        onChange={(v) => onInput('protected_attributes_tested', v)}
      />

      <BooleanToggle
        id="bias_mitigation_applied"
        label={t.fields.bias_mitigation_applied}
        value={inputs.bias_mitigation_applied}
        onChange={(v) => onInput('bias_mitigation_applied', v)}
      />

      {inputs.bias_mitigation_applied === true && (
        <TextArea
          id="bias_mitigation_method"
          label={t.fields.bias_mitigation_method}
          value={inputs.bias_mitigation_method}
          onChange={(v) => onInput('bias_mitigation_method', v)}
          onBlur={() => setMethodTouched(true)}
          placeholder="Describe the method used"
          minLength={20}
          error={methodError}
        />
      )}
    </SectionWrapper>
  );
}
