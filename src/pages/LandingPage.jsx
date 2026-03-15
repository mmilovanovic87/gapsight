import { useNavigate } from 'react-router-dom';
import en from '../locales/en.json';

const t = en.landing;

const STEP_COLORS = [
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-500 text-white',
  'bg-violet-600 text-white',
];

const FW_ACCENTS = [
  'border-l-blue-600',
  'border-l-emerald-600',
  'border-l-violet-600',
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
            {t.hero_headline}
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.hero_subheadline}
          </p>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {t.trust_badges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500 flex-shrink-0">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                {badge}
              </span>
            ))}
          </div>

          <button
            onClick={() => navigate('/assessment', { state: { fresh: true } })}
            className="mt-10 inline-block px-10 py-4 text-base font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            {t.hero_cta}
          </button>

          <p className="mt-6 text-xs text-slate-400">
            {t.hero_disclaimer}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-14">
            {t.how_title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {t.how_steps.map((step, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold mb-4 ${STEP_COLORS[i]}`}>
                  {i + 1}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frameworks */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-14">
            {t.frameworks_title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.frameworks.map((fw, i) => (
              <div
                key={fw.name}
                className={`rounded-lg border border-slate-200 border-l-4 ${FW_ACCENTS[i]} p-6`}
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {fw.name}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {fw.description}
                </p>
                <ul className="space-y-1.5">
                  {fw.examples.map((ex) => (
                    <li key={ex} className="text-xs text-slate-500 flex items-start gap-1.5">
                      <span className="text-slate-300 mt-0.5 flex-shrink-0">&bull;</span>
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
