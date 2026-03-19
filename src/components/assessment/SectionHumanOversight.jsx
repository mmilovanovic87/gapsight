import en from '../../locales/en.json';
import { SectionWrapper } from './FormField';

const t = en.assessment;
const sec = t.sections.human_oversight;

const QUESTIONS = [
  { key: 'q1', label: sec.q1, weight: '1x' },
  { key: 'q2', label: sec.q2, weight: '3x', hardBlocker: true },
  { key: 'q3', label: sec.q3, weight: '2x' },
  { key: 'q4', label: sec.q4, weight: '2x' },
  { key: 'q5', label: sec.q5, weight: '1x' },
];

const ANSWERS = [
  { value: 'yes', label: sec.answer_yes },
  { value: 'partially', label: sec.answer_partially },
  { value: 'no', label: sec.answer_no },
];

export default function SectionHumanOversight({ inputs, onInput, sectionNumber }) {
  const subtitle = t.section_subtitle.replace('{framework}', sec.framework);
  const oversight = inputs.human_oversight || {};

  const setAnswer = (qKey, val) => {
    onInput('human_oversight', { ...oversight, [qKey]: val });
  };

  return (
    <SectionWrapper title={sec.title} subtitle={subtitle} sectionNumber={sectionNumber}>
      <div className="space-y-4">
        {QUESTIONS.map((q) => (
          <div key={q.key} className="p-4 border border-gray-200 rounded-lg space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-gray-700">{q.label}</p>
              <span className="text-xs text-gray-400 shrink-0">
                Weight: {q.weight}
                {q.hardBlocker && <span className="ml-1 text-red-500 font-medium">(Hard blocker)</span>}
              </span>
            </div>
            <div className="flex gap-3">
              {ANSWERS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAnswer(q.key, a.value)}
                  className={`px-4 py-1.5 rounded text-sm border transition-colors ${
                    oversight[q.key] === a.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
            {q.hardBlocker && oversight[q.key] === 'no' && (
              <p className="text-xs text-red-600 font-medium">
                {sec.hard_blocker_message || 'EU AI Act Article 14: override mechanism is non-negotiable for high-risk systems.'}
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
