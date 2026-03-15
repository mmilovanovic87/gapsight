import en from '../../locales/en.json';
import { FloatInput, IntegerInput, EnumSelect, SectionWrapper } from './FormField';

const t = en.assessment;
const sec = t.sections.accuracy_performance;

export default function SectionAccuracy({ inputs, onInput, errors, sectionNumber }) {
  const subtitle = t.section_subtitle.replace('{framework}', sec.framework);

  return (
    <SectionWrapper title={sec.title} subtitle={subtitle} sectionNumber={sectionNumber}>
      <FloatInput
        id="overall_accuracy"
        label={t.fields.overall_accuracy}
        value={inputs.overall_accuracy}
        onChange={(v) => onInput('overall_accuracy', v)}
        min={0} max={1}
        direction="higher_better"
        passAt={0.80} reviewAt={0.65}
        tooltip="Proportion of correct predictions over total predictions."
        error={errors.overall_accuracy}
      />
      <FloatInput
        id="f1_score"
        label={t.fields.f1_score}
        value={inputs.f1_score}
        onChange={(v) => onInput('f1_score', v)}
        min={0} max={1}
        direction="higher_better"
        passAt={0.75} reviewAt={0.60}
        tooltip="Harmonic mean of precision and recall. Especially relevant for imbalanced datasets."
        error={errors.f1_score}
      />
      <FloatInput
        id="auc_roc"
        label={t.fields.auc_roc}
        value={inputs.auc_roc}
        onChange={(v) => onInput('auc_roc', v)}
        min={0} max={1}
        direction="higher_better"
        passAt={0.80} reviewAt={0.65}
        tooltip="Area under the receiver operating characteristic curve. Measures discriminative ability."
        error={errors.auc_roc}
      />
      <IntegerInput
        id="test_set_size"
        label={t.fields.test_set_size}
        value={inputs.test_set_size}
        onChange={(v) => onInput('test_set_size', v)}
        min={1}
        tooltip="Number of samples in the test set used for evaluation."
        error={errors.test_set_size}
        warning={
          inputs.test_set_size != null && inputs.test_set_size < 30
            ? t.validation.very_small_test_set
            : inputs.test_set_size != null && inputs.test_set_size < 100
              ? t.validation.small_test_set
              : null
        }
      />
      <EnumSelect
        id="test_set_representative"
        label={t.fields.test_set_representative}
        value={inputs.test_set_representative}
        onChange={(v) => onInput('test_set_representative', v)}
        options={Object.entries(t.fields.test_set_representative_options).map(([k, v]) => ({ value: k, label: v }))}
        error={errors.test_set_representative}
      />
    </SectionWrapper>
  );
}
