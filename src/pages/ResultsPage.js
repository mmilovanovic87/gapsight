import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import en from '../locales/en.json';
import kbChangelog from '../data/kb-changelog.json';
import useAssessmentStore from '../hooks/useAssessmentStore';
import { computeResults } from '../logic/compute-results';
import { downloadJsonExport } from '../logic/export-json';
import { downloadHtmlExport } from '../logic/export-html';
import ShareModal from '../components/ShareModal';
import FeedbackForm from '../components/FeedbackForm';

const t = en.results;

const RISK_COLORS = {
  CRITICAL: 'text-red-700 border-red-500 bg-red-50',
  HIGH: 'text-orange-700 border-orange-500 bg-orange-50',
  MEDIUM: 'text-yellow-700 border-yellow-500 bg-yellow-50',
  LOW: 'text-green-700 border-green-500 bg-green-50',
};

const STATUS_STYLES = {
  PASS: 'bg-green-100 text-green-800',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  FAIL: 'bg-red-100 text-red-800',
  CRITICAL_FAIL: 'bg-red-200 text-red-900 font-bold',
  NOT_APPLICABLE: 'bg-gray-100 text-gray-500',
  PROCESS_REQUIRED: 'bg-yellow-100 text-yellow-800',
};

function StatusBadge({ status }) {
  const label = status === 'CRITICAL_FAIL' ? 'CRITICAL' : status === 'PROCESS_REQUIRED' ? 'REVIEW' : status === 'NOT_APPLICABLE' ? 'N/A' : status;
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.FAIL}`}>
      {label}
    </span>
  );
}

const FW_NAMES = { eu_ai_act: 'EU AI Act', nist_ai_rmf: 'NIST RMF', iso_42001: 'ISO 42001' };
const URGENCY_STYLES = {
  CRITICAL: { border: 'border-red-300', bg: 'bg-red-50', text: 'text-red-700' },
  HIGH: { border: 'border-orange-300', bg: 'bg-orange-50', text: 'text-orange-700' },
  MEDIUM: { border: 'border-yellow-300', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  ONGOING: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700' },
};
const URGENCY_LABELS = { CRITICAL: t.urgency_critical, HIGH: t.urgency_high, MEDIUM: t.urgency_medium, ONGOING: t.urgency_ongoing };

export default function ResultsPage({ onShowRiskModal }) {
  const { profile, inputs } = useAssessmentStore();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);

  const results = useMemo(() => computeResults(inputs, profile), [inputs, profile]);

  const session = useMemo(() => {
    try {
      const raw = localStorage.getItem('gapsight_session');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const kbVersion = kbChangelog.current_version;
  const kbDate = kbChangelog.versions[0].date;
  const criticalCount = results.riskLevel.criteria.critical;

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {t.back_to_form}
        </button>
      </div>

      {/* Cross-metric warnings (above summary) */}
      {results.crossMetricWarnings.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{t.cross_metric_title}</h2>
          <div className="space-y-2">
            {results.crossMetricWarnings.map((w) => (
              <div
                key={w.id}
                className={`p-3 rounded-lg text-sm ${
                  w.severity === 'CRITICAL' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                }`}
              >
                <span className="mr-1">{w.severity === 'CRITICAL' ? '\u26D4' : '\u26A0'}</span>
                <strong>{w.severity}</strong>: {w.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary panel */}
      <div className={`border-2 rounded-lg p-6 mb-6 ${RISK_COLORS[results.riskLevel.level]}`}>
        <h2 className="text-lg font-semibold mb-4">{t.summary_title}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="text-gray-500">{t.profile_label}: </span>
            <span>{profile.role} | {profile.risk_category}{profile.gpai_flag ? ' | GPAI' : ''} | {profile.deployment_status}</span>
          </div>
          <div>
            <span className="text-gray-500">{t.generated_label}: </span>
            <span>{results.generatedAt.slice(0, 16).replace('T', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-500">KB: </span>
            <span>v{kbVersion} | {kbDate}</span>
          </div>
          <div>
            <span className="text-gray-500">{t.thresholds_label}: </span>
            <span className="text-xs italic">{t.thresholds_value}</span>
          </div>
        </div>

        {criticalCount > 0 && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-900 font-semibold">
            {'\u26D4'} {t.critical_issues.replace('{count}', criticalCount)}
          </div>
        )}

        {/* Framework summary */}
        <div className="mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="py-2">Framework</th>
                <th className="py-2">{t.fw_pass}</th>
                <th className="py-2">{t.fw_review}</th>
                <th className="py-2">{t.fw_fail}</th>
                <th className="py-2">{t.fw_critical}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(results.frameworkSummary).map(([fw, counts]) => (
                <tr key={fw} className="border-t border-gray-200">
                  <td className="py-2 font-medium">{FW_NAMES[fw]}</td>
                  <td className="py-2 text-green-700">{counts.pass}/{counts.total}</td>
                  <td className="py-2 text-yellow-700">{counts.review}</td>
                  <td className="py-2 text-red-700">{counts.fail}</td>
                  <td className="py-2 text-red-700 font-bold">{counts.critical || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Risk level */}
        <div className="text-center pt-4 border-t border-current/20">
          <div className="text-sm text-gray-500">{t.risk_level_label}</div>
          <div className="text-3xl font-bold mt-1">{results.riskLevel.level}</div>
          <p className="text-sm mt-1">{results.riskLevel.message}</p>
          <button
            onClick={onShowRiskModal}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {t.how_calculated}
          </button>
        </div>
      </div>

      {/* Metric results */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">{t.metric_results_title}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                <th className="py-2 px-3">Metric</th>
                <th className="py-2 px-3">Value</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.metricResults.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="py-2 px-3">{r.label}</td>
                  <td className="py-2 px-3 font-mono text-xs">{r.value !== null && r.value !== undefined ? String(r.value) : '—'}</td>
                  <td className="py-2 px-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process results */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">{t.process_results_title}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                <th className="py-2 px-3">Requirement</th>
                <th className="py-2 px-3">Value</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.processResults.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="py-2 px-3">{r.label}</td>
                  <td className="py-2 px-3 text-xs">{r.value || '—'}</td>
                  <td className="py-2 px-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Human oversight */}
      {results.oversightResult && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{t.oversight_title}</h2>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm">
                {t.oversight_score.replace('{score}', (results.oversightResult.value * 100).toFixed(0))}
              </span>
              <StatusBadge status={results.oversightResult.status} />
            </div>
            {results.oversightResult.message && (
              <p className="text-sm text-red-700 mt-2">{results.oversightResult.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Action items */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">{t.action_items_title}</h2>
        {Object.entries(results.actionItems).every(([, items]) => items.length === 0) ? (
          <p className="text-sm text-gray-500">{t.no_action_items}</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(results.actionItems).map(([urgency, items]) => {
              if (items.length === 0) return null;
              const style = URGENCY_STYLES[urgency];
              return (
                <div key={urgency} className={`border ${style.border} rounded-lg overflow-hidden`}>
                  <div className={`px-4 py-2 ${style.bg} ${style.text} text-sm font-semibold`}>
                    {URGENCY_LABELS[urgency]} ({items.length})
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <li key={item.id} className="px-4 py-3">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-sm text-gray-600 mt-0.5">{item.action}</div>
                        {item.frameworks && item.frameworks.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {Array.isArray(item.frameworks) ? item.frameworks.join(', ') : ''}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export & Share */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold mb-3">{t.export_title}</h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => downloadJsonExport(results, session)}
            className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {t.export_json}
          </button>
          <button
            onClick={() => downloadHtmlExport(results, session)}
            className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {t.export_html}
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {t.share_button}
          </button>
        </div>
      </div>

      {/* Feedback */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <FeedbackForm />
      </div>

      {showShareModal && (
        <ShareModal
          assessment={{
            assessment_id: session?.assessment_id,
            generated_at: results.generatedAt,
            kb_version: session?.kb_version,
            tos_accepted_at: session?.tos_accepted_at,
            disclaimer_confirmed_at: session?.disclaimer_confirmed_at,
            profile,
            inputs,
            results,
            cross_metric_warnings: results.crossMetricWarnings,
            action_items: results.actionItems,
            risk_level: results.riskLevel?.level,
            risk_level_criteria: results.riskLevel?.criteria,
          }}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </main>
  );
}
