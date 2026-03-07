import { useNavigate } from 'react-router-dom';
import en from '../locales/en.json';

const t = en.landing;

const STEP_ICONS = [
  /* 1 — Profile */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
  /* 2 — Metrics */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M3 3v18h18" />
    <path d="M7 16l4-8 4 4 4-6" />
  </svg>,
  /* 3 — Report */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
    <path d="M12 15l-3 6h6l-3-6z" />
  </svg>,
  /* 4 — Export */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>,
];

const FW_COLORS = [
  'border-blue-200 bg-blue-50',
  'border-emerald-200 bg-emerald-50',
  'border-violet-200 bg-violet-50',
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-white">
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-28 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
            {t.hero_headline}
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.hero_subheadline}
          </p>
          <button
            onClick={() => navigate('/assessment')}
            className="mt-10 inline-block px-8 py-3.5 text-base font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
          >
            {t.hero_cta}
          </button>
        </div>
        {/* Disclaimer strip */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 backdrop-blur-sm border-t border-white/10">
          <p className="text-center text-xs text-slate-400 py-2.5 px-4">
            {t.hero_disclaimer}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-14">
          {t.how_title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.how_steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 mb-5">
                {STEP_ICONS[i]}
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Step {i + 1}
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Frameworks */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-14">
            {t.frameworks_title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.frameworks.map((fw, i) => (
              <div
                key={fw.name}
                className={`rounded-xl border p-6 ${FW_COLORS[i]}`}
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {fw.name}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {fw.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
