import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import en from '../locales/en.json';
import useAssessmentStore from '../hooks/useAssessmentStore';
import TosModal from '../components/TosModal';
import DeploymentStep from '../components/assessment/DeploymentStep';
import FrameworkSelectionStep from '../components/assessment/FrameworkSelectionStep';
import OnboardingStep from '../components/assessment/OnboardingStep';
import SectionAccuracy from '../components/assessment/SectionAccuracy';
import SectionFairness from '../components/assessment/SectionFairness';
import SectionRobustness from '../components/assessment/SectionRobustness';
import SectionExplainability from '../components/assessment/SectionExplainability';
import SectionHumanOversight from '../components/assessment/SectionHumanOversight';
import SectionGPAI from '../components/assessment/SectionGPAI';
import SectionGovernance from '../components/assessment/SectionGovernance';

const t = en.assessment;

const STEPS = {
  DEPLOYMENT: 0,
  FRAMEWORKS: 1,
  ONBOARDING: 2,
  FORM: 3,
};

function validateFloat(value, min, max) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && isNaN(value)) return null; // treat NaN as empty
  const n = parseFloat(value);
  if (isNaN(n)) return t.validation.range.replace('{min}', min).replace('{max}', max);
  if (min !== undefined && n < min) return t.validation.range.replace('{min}', min).replace('{max}', max);
  if (max !== undefined && n > max) return t.validation.range.replace('{min}', min).replace('{max}', max);
  return null;
}

function validateInputs(inputs, profile) {
  const errors = {};

  // Accuracy section
  errors.overall_accuracy = validateFloat(inputs.overall_accuracy, 0, 1);
  errors.f1_score = validateFloat(inputs.f1_score, 0, 1);
  errors.auc_roc = validateFloat(inputs.auc_roc, 0, 1);

  if (inputs.test_set_size !== null && inputs.test_set_size !== undefined &&
      !(typeof inputs.test_set_size === 'number' && isNaN(inputs.test_set_size))) {
    if (!Number.isInteger(inputs.test_set_size) || inputs.test_set_size <= 0) {
      errors.test_set_size = t.validation.positive_integer;
    }
  }

  // Fairness section
  errors.demographic_parity_diff = validateFloat(inputs.demographic_parity_diff, -1, 1);
  errors.equalized_odds_diff = validateFloat(inputs.equalized_odds_diff, -1, 1);
  if (inputs.disparate_impact_ratio !== null && inputs.disparate_impact_ratio !== undefined &&
      inputs.disparate_impact_ratio !== 'NOT_PROVIDED_REQUIRED') {
    const n = parseFloat(inputs.disparate_impact_ratio);
    if (isNaN(n) || n < 0) errors.disparate_impact_ratio = t.validation.range.replace('{min}', '0').replace('{max}', '\u221E');
  }

  // Robustness section
  errors.data_drift_score = validateFloat(inputs.data_drift_score, 0, 1);
  errors.concept_drift_score = validateFloat(inputs.concept_drift_score, 0, 1);
  errors.adversarial_robustness_score = validateFloat(inputs.adversarial_robustness_score, 0, 1);

  // Explainability section
  errors.explanation_coverage = validateFloat(inputs.explanation_coverage, 0, 1);

  // Bias mitigation method min length
  if (inputs.bias_mitigation_applied && inputs.bias_mitigation_method &&
      inputs.bias_mitigation_method.length > 0 && inputs.bias_mitigation_method.length < 20) {
    errors.bias_mitigation_method = t.validation.min_length.replace('{min}', '20');
  }

  // Clean out null errors
  Object.keys(errors).forEach((k) => {
    if (!errors[k]) delete errors[k];
  });

  return errors;
}

const FIELD_TO_SECTION = {
  overall_accuracy: 'accuracy',
  f1_score: 'accuracy',
  auc_roc: 'accuracy',
  test_set_size: 'accuracy',
  demographic_parity_diff: 'fairness',
  equalized_odds_diff: 'fairness',
  disparate_impact_ratio: 'fairness',
  bias_mitigation_method: 'fairness',
  data_drift_score: 'robustness',
  concept_drift_score: 'robustness',
  adversarial_robustness_score: 'robustness',
  explanation_coverage: 'explainability',
};

function findSectionForError(field, formSections) {
  const section = FIELD_TO_SECTION[field];
  if (!section) return null;
  const idx = formSections.indexOf(section);
  return idx >= 0 ? idx : null;
}

export default function AssessmentPage({ onTriggerDisclaimer, tosAccepted, onTosAccept, onTosExit }) {
  const { profile, inputs, restored, setProfile, setInput, setInputs, dismissRestored } = useAssessmentStore();
  const [step, setStep] = useState(STEPS.DEPLOYMENT);
  const [formSection, setFormSection] = useState(0);
  const [errors, setErrors] = useState({});
  const [errorBanner, setErrorBanner] = useState('');
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const navigate = useNavigate();

  // Show restored banner
  useEffect(() => {
    if (restored && profile.role) {
      setShowRestoredBanner(true);
      // Jump to form step if profile is complete
      if (profile.deployment_status && profile.role && profile.risk_category !== null && profile.gpai_flag !== null) {
        setStep(STEPS.FORM);
      } else if (profile.deployment_status && profile.frameworks_selected) {
        setStep(STEPS.ONBOARDING);
      } else if (profile.deployment_status) {
        setStep(STEPS.FRAMEWORKS);
      }
    }
  }, [restored, profile]);

  const showGpai = profile.gpai_flag === true;

  const formSections = useMemo(() => {
    const sections = [
      'accuracy',
      'fairness',
      'robustness',
      'explainability',
      'human_oversight',
    ];
    if (showGpai) sections.push('gpai');
    sections.push('governance');
    return sections;
  }, [showGpai]);

  const canAdvanceDeployment = !!profile.deployment_status;
  const canAdvanceFrameworks = !!(profile.frameworks_selected && profile.frameworks_selected.length > 0);
  const canAdvanceOnboarding = !!(profile.role && profile.gpai_flag !== null && profile.risk_category);

  const handleNext = useCallback(() => {
    if (step === STEPS.DEPLOYMENT && canAdvanceDeployment) {
      setStep(STEPS.FRAMEWORKS);
    } else if (step === STEPS.FRAMEWORKS && canAdvanceFrameworks) {
      setStep(STEPS.ONBOARDING);
    } else if (step === STEPS.ONBOARDING && canAdvanceOnboarding) {
      setStep(STEPS.FORM);
      setFormSection(0);
    } else if (step === STEPS.FORM) {
      if (formSection < formSections.length - 1) {
        setFormSection((s) => s + 1);
      }
    }
  }, [step, canAdvanceDeployment, canAdvanceFrameworks, canAdvanceOnboarding, formSection, formSections.length]);

  const handleBack = useCallback(() => {
    if (step === STEPS.FORM && formSection > 0) {
      setFormSection((s) => s - 1);
    } else if (step === STEPS.FORM && formSection === 0) {
      setStep(STEPS.ONBOARDING);
    } else if (step === STEPS.ONBOARDING) {
      setStep(STEPS.FRAMEWORKS);
    } else if (step === STEPS.FRAMEWORKS) {
      setStep(STEPS.DEPLOYMENT);
    }
  }, [step, formSection]);

  const handleGenerate = useCallback(() => {
    const validationErrors = validateInputs(inputs, profile);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      // Navigate to the first section that has an error
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorSection = findSectionForError(firstErrorField, formSections);
      if (errorSection !== null && errorSection !== formSection) {
        const sectionName = formSections[errorSection].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        setErrorBanner(t.validation.errors_in_section.replace('{section}', sectionName));
        setFormSection(errorSection);
      } else {
        setErrorBanner('');
      }
      return;
    }
    setErrorBanner('');

    // Trigger inline disclaimer (once per session)
    const alreadyShown = onTriggerDisclaimer();
    if (!alreadyShown) {
      // The disclaimer modal will show; after user confirms,
      // they'll need to click Generate again
      return;
    }

    // Navigate to results
    navigate('/results');
  }, [inputs, profile, onTriggerDisclaimer, navigate, formSections, formSection]);

  const isLastSection = formSection === formSections.length - 1;

  const renderFormSection = () => {
    const section = formSections[formSection];
    switch (section) {
      case 'accuracy':
        return <SectionAccuracy inputs={inputs} onInput={setInput} errors={errors} />;
      case 'fairness':
        return <SectionFairness inputs={inputs} onInput={setInput} onInputs={setInputs} profile={profile} errors={errors} />;
      case 'robustness':
        return <SectionRobustness inputs={inputs} onInput={setInput} errors={errors} />;
      case 'explainability':
        return <SectionExplainability inputs={inputs} onInput={setInput} profile={profile} errors={errors} />;
      case 'human_oversight':
        return <SectionHumanOversight inputs={inputs} onInput={setInput} />;
      case 'gpai':
        return <SectionGPAI inputs={inputs} onInput={setInput} errors={errors} profile={profile} />;
      case 'governance':
        return <SectionGovernance inputs={inputs} onInput={setInput} profile={profile} errors={errors} />;
      default:
        return null;
    }
  };

  // Progress indicator
  const totalSteps = 3 + formSections.length; // deployment + frameworks + onboarding + form sections
  const currentProgress = step === STEPS.DEPLOYMENT ? 1
    : step === STEPS.FRAMEWORKS ? 2
    : step === STEPS.ONBOARDING ? 3
    : 3 + formSection + 1;

  if (!tosAccepted) {
    return <TosModal onAccept={onTosAccept} onExit={onTosExit} />;
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      {showRestoredBanner && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700">{t.continuing_previous}</span>
          <button
            type="button"
            onClick={() => { setShowRestoredBanner(false); dismissRestored(); }}
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Step {currentProgress} of {totalSteps}</span>
          <span>
            {step === STEPS.DEPLOYMENT && t.step_deployment}
            {step === STEPS.FRAMEWORKS && t.step_frameworks}
            {step === STEPS.ONBOARDING && t.step_onboarding}
            {step === STEPS.FORM && t.step_form}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(currentProgress / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      {step === STEPS.DEPLOYMENT && (
        <DeploymentStep
          value={profile.deployment_status}
          onChange={(v) => setProfile({ deployment_status: v })}
        />
      )}

      {step === STEPS.FRAMEWORKS && (
        <FrameworkSelectionStep
          value={{ frameworks_selected: profile.frameworks_selected, frameworks_answers: profile.frameworks_answers }}
          onChange={({ frameworks_selected, frameworks_answers }) =>
            setProfile({ frameworks_selected, frameworks_answers })
          }
        />
      )}

      {step === STEPS.ONBOARDING && (
        <OnboardingStep
          profile={profile}
          onProfileChange={setProfile}
        />
      )}

      {step === STEPS.FORM && (
        <>
          {/* Section tabs */}
          <div className="mb-6 flex gap-1 overflow-x-auto pb-2">
            {formSections.map((sec, i) => (
              <button
                key={sec}
                type="button"
                onClick={() => { setFormSection(i); setErrorBanner(''); }}
                className={`px-3 py-1.5 rounded text-xs whitespace-nowrap transition-colors ${
                  i === formSection
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i + 1}. {sec.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
          {renderFormSection()}
        </>
      )}

      {errorBanner && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorBanner}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === STEPS.DEPLOYMENT}
          className={`px-4 py-2 text-sm rounded border ${
            step === STEPS.DEPLOYMENT
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          {t.back}
        </button>

        {(step !== STEPS.FORM || !isLastSection) ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={
              (step === STEPS.DEPLOYMENT && !canAdvanceDeployment) ||
              (step === STEPS.FRAMEWORKS && !canAdvanceFrameworks) ||
              (step === STEPS.ONBOARDING && !canAdvanceOnboarding)
            }
            className={`px-6 py-2 text-sm rounded ${
              (step === STEPS.DEPLOYMENT && !canAdvanceDeployment) ||
              (step === STEPS.FRAMEWORKS && !canAdvanceFrameworks) ||
              (step === STEPS.ONBOARDING && !canAdvanceOnboarding)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {t.next}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            className="px-6 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700"
          >
            {t.generate_results}
          </button>
        )}
      </div>
    </main>
  );
}
