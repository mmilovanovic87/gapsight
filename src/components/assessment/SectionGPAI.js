import en from '../../locales/en.json';
import knowledgeBase from '../../data/knowledge-base.json';
import { EnumSelect, BooleanToggle, SectionWrapper } from './FormField';

const t = en.assessment;
const sec = t.sections.gpai;

const STATUS_OPTIONS = [
  { value: 'yes', label: en.assessment.enum_labels.yes },
  { value: 'in_progress', label: en.assessment.enum_labels.in_progress },
  { value: 'no', label: en.assessment.enum_labels.no },
];

const NOTIFICATION_OPTIONS = [
  { value: 'yes', label: en.assessment.enum_labels.yes },
  { value: 'no', label: en.assessment.enum_labels.no },
  { value: 'not_applicable', label: en.assessment.enum_labels.not_applicable },
];

export default function SectionGPAI({ inputs, onInput, errors }) {
  const subtitle = t.section_subtitle.replace('{framework}', sec.framework);
  const flopsVal = inputs.training_flops ? parseFloat(inputs.training_flops) : 0;
  const isSystemicRisk = flopsVal >= 1e25;

  const copyrightChecklist = inputs.gpai_copyright_checklist || {};
  const setCopyrightItem = (id, checked) => {
    onInput('gpai_copyright_checklist', { ...copyrightChecklist, [id]: checked });
  };

  return (
    <SectionWrapper title={sec.title} subtitle={subtitle}>
      <div className="space-y-1">
        <label htmlFor="training_flops" className="block text-sm font-medium text-gray-700">
          {t.fields.training_flops}
        </label>
        <input
          id="training_flops"
          type="text"
          value={inputs.training_flops ?? ''}
          onChange={(e) => onInput('training_flops', e.target.value)}
          placeholder="e.g. 1e24"
          className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.training_flops && <p className="text-xs text-red-500">{errors.training_flops}</p>}
      </div>

      {isSystemicRisk && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {sec.systemic_risk_warning}
        </div>
      )}

      <EnumSelect
        id="training_data_summary_published"
        label={t.fields.training_data_summary_published}
        value={inputs.training_data_summary_published}
        onChange={(v) => onInput('training_data_summary_published', v)}
        options={STATUS_OPTIONS}
        error={errors.training_data_summary_published}
      />

      <EnumSelect
        id="copyright_policy_status"
        label={t.fields.copyright_policy_status}
        value={inputs.copyright_policy_status}
        onChange={(v) => onInput('copyright_policy_status', v)}
        options={STATUS_OPTIONS}
        error={errors.copyright_policy_status}
      />

      {inputs.copyright_policy_status && inputs.copyright_policy_status !== 'yes' && (
        <div className="ml-4 p-4 border border-gray-200 rounded space-y-3">
          <h4 className="text-sm font-medium text-gray-700">{sec.copyright_checklist_title}</h4>
          {knowledgeBase.gpai_copyright_checklist.map((item) => (
            <label key={item.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!copyrightChecklist[item.id]}
                onChange={(e) => setCopyrightItem(item.id, e.target.checked)}
                className="mt-0.5 rounded text-blue-600"
              />
              {item.label}
            </label>
          ))}
        </div>
      )}

      <BooleanToggle
        id="model_evaluations_conducted"
        label={t.fields.model_evaluations_conducted}
        value={inputs.model_evaluations_conducted}
        onChange={(v) => onInput('model_evaluations_conducted', v)}
      />

      <BooleanToggle
        id="adversarial_testing_conducted"
        label={t.fields.adversarial_testing_conducted}
        value={inputs.adversarial_testing_conducted}
        onChange={(v) => onInput('adversarial_testing_conducted', v)}
      />

      <EnumSelect
        id="systemic_risk_notification_sent"
        label={t.fields.systemic_risk_notification_sent}
        value={inputs.systemic_risk_notification_sent}
        onChange={(v) => onInput('systemic_risk_notification_sent', v)}
        options={NOTIFICATION_OPTIONS}
        error={errors.systemic_risk_notification_sent}
      />
    </SectionWrapper>
  );
}
