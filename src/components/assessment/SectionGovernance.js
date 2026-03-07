import en from '../../locales/en.json';
import knowledgeBase from '../../data/knowledge-base.json';
import { getProcessRequirementsForProfile } from '../../logic/profile-filter';
import { SectionWrapper, TextArea, DateInput } from './FormField';

const t = en.assessment;
const sec = t.sections.governance;

const STATUS_OPTIONS_3 = [
  { value: 'yes', label: en.assessment.enum_labels.yes },
  { value: 'in_progress', label: en.assessment.enum_labels.in_progress },
  { value: 'no', label: en.assessment.enum_labels.no },
];

const STATUS_OPTIONS_PARTIAL = [
  { value: 'yes', label: en.assessment.enum_labels.yes },
  { value: 'partial', label: en.assessment.enum_labels.partial },
  { value: 'no', label: en.assessment.enum_labels.no },
];

const STATUS_OPTIONS_2 = [
  { value: 'yes', label: en.assessment.enum_labels.yes },
  { value: 'no', label: en.assessment.enum_labels.no },
];

const STATUS_OPTIONS_NA = [
  { value: 'yes', label: en.assessment.enum_labels.yes },
  { value: 'no', label: en.assessment.enum_labels.no },
  { value: 'not_applicable', label: en.assessment.enum_labels.not_applicable },
];

function getOptionsForReq(req) {
  if (req.options.includes('partial')) return STATUS_OPTIONS_PARTIAL;
  if (req.options.includes('not_applicable')) return STATUS_OPTIONS_NA;
  if (req.options.includes('in_progress')) return STATUS_OPTIONS_3;
  return STATUS_OPTIONS_2;
}

export default function SectionGovernance({ inputs, onInput, profile, errors, sectionNumber }) {
  const subtitle = t.section_subtitle.replace('{framework}', sec.framework);
  const requirements = getProcessRequirementsForProfile(profile);

  const governanceData = inputs.governance || {};
  const annexIvChecks = inputs.annex_iv_checklist || {};

  const setGovField = (reqId, field, value) => {
    const current = governanceData[reqId] || {};
    onInput('governance', {
      ...governanceData,
      [reqId]: { ...current, [field]: value },
    });
  };

  const setAnnexItem = (id, checked) => {
    onInput('annex_iv_checklist', { ...annexIvChecks, [id]: checked });
  };

  const showAnnexIv = governanceData.technical_documentation?.status === 'partial';

  return (
    <SectionWrapper title={sec.title} subtitle={subtitle} sectionNumber={sectionNumber}>
      {requirements.length === 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
          {t.section_not_applicable
            .replace('{risk}', profile.risk_category || 'Unknown')
            .replace('{role}', profile.role || 'Unknown')}
        </div>
      )}
      {requirements.map((req) => {
        const data = governanceData[req.id] || {};
        const options = getOptionsForReq(req);
        const showEvidence = data.status === 'yes' || data.status === 'in_progress' || data.status === 'partial';
        const showDate = data.status === 'in_progress';

        return (
          <div key={req.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-gray-700">
                {t.fields[req.id] || req.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGovField(req.id, 'status', opt.value)}
                  className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                    data.status === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {data.status === 'no' && req.if_no_guidance && (
              <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                <span className="font-medium">{sec.guidance_label}: </span>
                {req.if_no_guidance}
              </div>
            )}

            {showEvidence && (
              <TextArea
                id={`${req.id}_evidence`}
                label={sec.evidence_label}
                value={data.evidence}
                onChange={(v) => setGovField(req.id, 'evidence', v)}
                placeholder={sec.evidence_placeholder}
                minLength={20}
                error={
                  data.evidence && data.evidence.length > 0 && data.evidence.length < 20
                    ? t.validation.min_length.replace('{min}', '20')
                    : null
                }
              />
            )}

            {showDate && (
              <DateInput
                id={`${req.id}_completion_date`}
                label={sec.completion_date_label}
                value={data.completion_date}
                onChange={(v) => setGovField(req.id, 'completion_date', v)}
              />
            )}
          </div>
        );
      })}

      {/* Annex IV checklist - shown when technical_documentation is partial */}
      {showAnnexIv && (
        <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-3">
          <h3 className="text-sm font-semibold text-blue-800">{sec.annex_iv_title}</h3>
          <p className="text-xs text-blue-600">{sec.annex_iv_subtitle}</p>
          {knowledgeBase.annex_iv_elements.map((item) => (
            <label key={item.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!annexIvChecks[item.id]}
                onChange={(e) => setAnnexItem(item.id, e.target.checked)}
                className="mt-0.5 rounded text-blue-600"
              />
              <span>
                <span className="text-gray-500 mr-1">{item.id}.</span>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
