import { useNavigate } from 'react-router-dom';

/** Reusable checkmark SVG icon for bullet lists. */
function CheckIcon({ className = 'w-5 h-5 text-emerald-400 flex-shrink-0' }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  const handleScrollToCI = (e) => {
    e.preventDefault();
    document.getElementById('compliance-as-code')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* ── SECTION 1: HERO ── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
            Free &middot; Open Source &middot; No Login Required
          </p>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Know your EU AI Act exposure before the auditor does.
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            GapSight maps your ML metrics to compliance gaps across EU AI Act, NIST AI RMF, and ISO 42001. Get a prioritized action list in minutes.
          </p>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={() => navigate('/assessment', { state: { fresh: true } })}
              className="px-8 py-3 text-base font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Start Assessment
            </button>
            <a
              href="https://github.com/mmilovanovic87/gapsight"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 text-base font-semibold rounded-lg border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-colors"
            >
              View on GitHub
            </a>
            <a
              href="#compliance-as-code"
              onClick={handleScrollToCI}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              See how CI integration works &darr;
            </a>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: SOCIAL PROOF BAR ── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span className="text-sm text-slate-500">Free forever &middot; no credit card</span>
            <span className="text-sm text-slate-500">EU AI Act &middot; NIST AI RMF &middot; ISO 42001</span>
            <span className="text-sm text-slate-500">Open source &middot; MIT License</span>
          </div>
          <a href="https://github.com/mmilovanovic87/gapsight" target="_blank" rel="noopener noreferrer">
            <img
              src="https://img.shields.io/github/stars/mmilovanovic87/gapsight?style=social"
              alt="GitHub stars"
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'inline'; }}
            />
            <span style={{ display: 'none' }} className="text-sm text-slate-500">&#11088; GitHub</span>
          </a>
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-14">
            Three steps to compliance clarity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">1. Pick your use case</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Choose from 8 templates &mdash; CV screening, fraud detection, credit scoring, and more. Pre-filled with realistic baselines.
              </p>
            </div>
            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">2. Enter your metrics</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Paste in your accuracy, fairness scores, drift metrics, and governance status. No data leaves your browser.
              </p>
            </div>
            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 text-amber-600 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">3. Get your gap report</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Receive a prioritized action list mapped to specific articles in EU AI Act, NIST AI RMF, and ISO 42001.
              </p>
            </div>
          </div>
          <div className="mt-14 text-center">
            <button
              onClick={() => navigate('/assessment', { state: { fresh: true } })}
              className="px-8 py-3 text-base font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Start free assessment &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: COMPLIANCE AS CODE ── */}
      <section id="compliance-as-code" className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
            Feature &middot; Compliance as Code
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Run compliance checks the same way you run unit tests.
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl">
            Add one step to your GitHub Actions workflow. Get a compliance report on every push. Fail the build if risk exceeds your threshold.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Code block */}
            <div className="rounded-lg bg-black/40 border border-slate-700 p-5 overflow-x-auto">
              <pre className="text-sm leading-relaxed font-mono whitespace-pre">
                <span className="text-slate-500">{'# .github/workflows/compliance.yml'}</span>{'\n'}
                <span className="text-cyan-400">{'- uses: '}</span>
                <span className="text-slate-200">{'mmilovanovic87/gapsight/.github/actions/compliance-check@v1'}</span>{'\n'}
                <span className="text-cyan-400">{'  with:'}</span>{'\n'}
                <span className="text-slate-300">{'    assessment-path: '}</span>
                <span className="text-green-400">{"'.gapsight/assessment.json'"}</span>{'\n'}
                <span className="text-slate-300">{'    fail-on: '}</span>
                <span className="text-green-400">{"'HIGH'"}</span>
              </pre>
            </div>

            {/* Bullet points */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-slate-300 text-sm">Works with any CI/CD pipeline that supports GitHub Actions</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-slate-300 text-sm">Produces a downloadable compliance artifact on every run</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-slate-300 text-sm">Use the &ldquo;Export for CI&rdquo; button in the assessment to generate your config file</span>
              </div>
              <div className="mt-6">
                <a
                  href="https://github.com/mmilovanovic87/gapsight/blob/main/.github/actions/compliance-check/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Read the full documentation &rarr;
                </a>
              </div>
            </div>
          </div>

          <p className="mt-12 text-xs text-slate-500">
            Supports EU AI Act (Regulation 2024/1689), NIST AI RMF (2023), and ISO/IEC 42001:2023.
          </p>
        </div>
      </section>

      {/* ── SECTION 5: FEATURE GRID ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-14">
            Everything you need for AI compliance readiness
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: '8 use-case templates',
                description: 'Start from CV screening, fraud detection, credit scoring, medical diagnosis, or four other pre-built profiles. Edit to match your system.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
              },
              {
                title: 'Metric-to-regulation mapping',
                description: 'Every metric maps to specific articles. Accuracy \u2192 Article 15. Fairness \u2192 Article 10. Not a generic checklist \u2014 article-level precision.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
              },
              {
                title: 'CI/CD integration',
                description: 'Export your assessment as a JSON config file. Add one GitHub Action step. Compliance becomes a test, not a document.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
              },
              {
                title: 'Export and share',
                description: 'Export to JSON, HTML, or PDF. Generate shareable links with PIN protection. Everything runs in your browser \u2014 no data sent anywhere.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
              },
              {
                title: 'Three-state metric tracking',
                description: 'Track each metric as assessed (pass/fail), not assessed, or not applicable. gapsight-core handles each case correctly in CI.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
              },
              {
                title: 'EU AI Act deadlines are real',
                description: 'High-risk AI systems face August 2026 obligations. GapSight maps your current state to what you still need to do.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              },
            ].map((feature) => (
              <div key={feature.title} className="border border-slate-200 rounded-lg p-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: FRAMEWORK COVERAGE ── */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-14">
            Covers the frameworks that matter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-3">EU AI Act</div>
              <p className="text-xs text-slate-400 mb-3">Regulation (EU) 2024/1689</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Article-level mapping for High-Risk AI systems including Annex III use cases and Annex IV documentation requirements.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-3">NIST AI RMF</div>
              <p className="text-xs text-slate-400 mb-3">NIST AI 100-1 (2023)</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mapped to GOVERN, MAP, MEASURE, and MANAGE functions with subcategory-level precision.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="inline-block px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-3">ISO/IEC 42001</div>
              <p className="text-xs text-slate-400 mb-3">ISO/IEC 42001:2023</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Clause-level mapping including 6.1 risk actions, 8.4 impact assessment, and Annex A controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: BOTTOM CTA ── */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Start your compliance assessment in 5 minutes.
          </h2>
          <p className="text-slate-500 mb-10">
            Free. No signup. No data sent to any server.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/assessment', { state: { fresh: true } })}
              className="px-8 py-3 text-base font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Start Assessment &rarr;
            </button>
            <a
              href="https://github.com/mmilovanovic87/gapsight"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 text-base font-semibold rounded-lg border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-colors"
            >
              View on GitHub
            </a>
          </div>
          <p className="mt-8 text-xs text-slate-400">
            GapSight does not constitute legal advice. Results are indicative only.
          </p>
        </div>
      </section>
    </div>
  );
}
