import en from '../../locales/en.json';
import { FloatInput, EnumSelect, BooleanToggle, SectionWrapper } from './FormField';

const t = en.assessment;
const sec = t.sections.explainability_transparency;

export default function SectionExplainability({ inputs, onInput, profile, errors, sectionNumber }) {
  const subtitle = t.section_subtitle.replace('{framework}', sec.framework);
  const isHighRisk = profile.risk_category === 'high-risk';

  return (
    <SectionWrapper title={sec.title} subtitle={subtitle} sectionNumber={sectionNumber}>
      <EnumSelect
        id="explainability_method"
        label={t.fields.explainability_method}
        value={inputs.explainability_method}
        onChange={(v) => onInput('explainability_method', v)}
        options={t.fields.explainability_method_options.map((o) => ({ value: o, label: o }))}
        error={errors.explainability_method}
      />

      {inputs.explainability_method === 'None' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          No explainability method selected. All explainability items will be marked FAIL.
        </div>
      )}

      <FloatInput
        id="explanation_coverage"
        label={t.fields.explanation_coverage}
        value={inputs.explanation_coverage}
        onChange={(v) => onInput('explanation_coverage', v)}
        min={0} max={1}
        direction="higher_better"
        passAt={0.90} reviewAt={0.70}
        tooltip="Proportion of model predictions for which valid explanations are available."
        error={errors.explanation_coverage}
      />

      <BooleanToggle
        id="explanations_available_to_users"
        label={t.fields.explanations_available_to_users}
        value={inputs.explanations_available_to_users}
        onChange={(v) => onInput('explanations_available_to_users', v)}
      />

      <BooleanToggle
        id="model_card_exists"
        label={t.fields.model_card_exists}
        value={inputs.model_card_exists}
        onChange={(v) => onInput('model_card_exists', v)}
      />

      {inputs.model_card_exists === false && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
          {sec.model_card_help}
        </div>
      )}

      <BooleanToggle
        id="instructions_for_use_documented"
        label={t.fields.instructions_for_use_documented}
        value={inputs.instructions_for_use_documented}
        onChange={(v) => onInput('instructions_for_use_documented', v)}
      />

      {inputs.instructions_for_use_documented === false && isHighRisk && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {sec.instructions_critical}
        </div>
      )}
    </SectionWrapper>
  );
}
