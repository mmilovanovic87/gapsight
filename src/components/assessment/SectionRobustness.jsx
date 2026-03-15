import en from '../../locales/en.json';
import { FloatInput, BooleanToggle, DateInput, SectionWrapper } from './FormField';

const t = en.assessment;
const sec = t.sections.robustness_drift;

export default function SectionRobustness({ inputs, onInput, errors, sectionNumber }) {
  const subtitle = t.section_subtitle.replace('{framework}', sec.framework);

  return (
    <SectionWrapper title={sec.title} subtitle={subtitle} sectionNumber={sectionNumber}>
      <FloatInput
        id="data_drift_score"
        label={t.fields.data_drift_score}
        value={inputs.data_drift_score}
        onChange={(v) => onInput('data_drift_score', v)}
        min={0} max={1}
        direction="lower_better"
        passAt={0.10} reviewAt={0.20}
        tooltip="Statistical distance between training and live data distributions. Lower means less drift."
        error={errors.data_drift_score}
      />
      <FloatInput
        id="concept_drift_score"
        label={t.fields.concept_drift_score}
        value={inputs.concept_drift_score}
        onChange={(v) => onInput('concept_drift_score', v)}
        min={0} max={1}
        direction="lower_better"
        passAt={0.10} reviewAt={0.20}
        tooltip="Measure of change in the relationship between input features and target labels over time."
        error={errors.concept_drift_score}
      />
      <FloatInput
        id="adversarial_robustness_score"
        label={t.fields.adversarial_robustness_score}
        value={inputs.adversarial_robustness_score}
        onChange={(v) => onInput('adversarial_robustness_score', v)}
        min={0} max={1}
        direction="higher_better"
        passAt={0.70} reviewAt={0.50}
        tooltip="Model accuracy under adversarial attack conditions. Higher is better."
        error={errors.adversarial_robustness_score}
      />
      <BooleanToggle
        id="drift_monitoring_active"
        label={t.fields.drift_monitoring_active}
        value={inputs.drift_monitoring_active}
        onChange={(v) => onInput('drift_monitoring_active', v)}
      />
      <BooleanToggle
        id="failsafe_mechanism_documented"
        label={t.fields.failsafe_mechanism_documented}
        value={inputs.failsafe_mechanism_documented}
        onChange={(v) => onInput('failsafe_mechanism_documented', v)}
      />
      <DateInput
        id="last_retrain_date"
        label={t.fields.last_retrain_date}
        value={inputs.last_retrain_date}
        onChange={(v) => onInput('last_retrain_date', v)}
        error={errors.last_retrain_date}
      />
    </SectionWrapper>
  );
}
