import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import en from '../locales/en.json';
import kbChangelog from '../data/kb-changelog.json';
import { getSharedAssessment, verifyPin } from '../api/share-client';
import { RISK_LEVEL_STYLES, FRAMEWORK_NAMES, URGENCY_LEVEL_STYLES } from '../logic/constants';
import StatusBadge from '../components/StatusBadge';

const t = en.shared_view;

export default function SharedViewPage() {
  const { uuid } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsPin, setNeedsPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getSharedAssessment(uuid);
        if (cancelled) return;
        if (res.success === false) {
          setError(t.not_found);
        } else if (res.requires_pin) {
          setNeedsPin(true);
        } else {
          setData(res);
        }
      } catch {
        if (!cancelled) setError(t.not_found);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [uuid]);

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinError('');
    setPinLoading(true);
    try {
      const res = await verifyPin(uuid, pin);
      if (res.success === false) {
        setPinError(t.pin_error);
      } else {
        setData(res);
        setNeedsPin(false);
      }
    } catch {
      setPinError(t.pin_error);
    } finally {
      setPinLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-sm text-gray-500">{t.loading}</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <Link to="/" className="text-sm text-blue-600 hover:text-blue-800">{t.back_home}</Link>
      </main>
    );
  }

  if (needsPin) {
    return (
      <main className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-xl font-bold mb-4">{t.pin_title}</h1>
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder={t.pin_placeholder}
            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {pinError && <p className="text-sm text-red-600">{pinError}</p>}
          <button
            type="submit"
            disabled={pinLoading || pin.length < 4}
            className={`px-4 py-2 text-sm rounded text-white ${
              pinLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {t.pin_submit}
          </button>
        </form>
      </main>
    );
  }

  if (!data) return null;

  const currentKb = kbChangelog.current_version;
  const assessmentKb = data.kb_version;
  const kbMismatch = assessmentKb && assessmentKb !== currentKb;

  const results = data.results || {};
  const profile = data.profile || {};
  const riskLevel = results.risk_level || results.riskLevel || {};
  const metricResults = results.metricResults || results.metric_results || [];
  const processResults = results.processResults || results.process_results || [];
  const oversightResult = results.oversightResult || results.oversight_result;
  const actionItems = results.actionItems || results.action_items || {};
  const crossMetricWarnings = results.crossMetricWarnings || results.cross_metric_warnings || [];
  const frameworkSummary = results.frameworkSummary || results.framework_summary || {};
  const expiresAt = data.expires_at;

  const riskLevelValue = typeof riskLevel === 'string' ? riskLevel : (riskLevel.level || 'MEDIUM');
  const riskMessage = typeof riskLevel === 'object' ? riskLevel.message : '';

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      {/* Disclaimer */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
        {t.disclaimer}
      </div>

      {/* KB version warning */}
      {kbMismatch && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
          {t.kb_version_warning.replace('{version}', assessmentKb)}
        </div>
      )}

      {/* Expiry */}
      {expiresAt && (
        <p className="text-xs text-gray-500 mb-4">
          {t.expires_at.replace('{date}', new Date(expiresAt).toLocaleDateString())}
        </p>
      )}

      <h1 className="text-2xl font-bold mb-6">{t.title}</h1>

      {/* Cross-metric warnings */}
      {crossMetricWarnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {crossMetricWarnings.map((w, i) => (
            <div
              key={w.id || i}
              className={`p-3 rounded-lg text-sm ${
                w.severity === 'CRITICAL' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              }`}
            >
              <strong>{w.severity}</strong>: {w.message}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className={`border-2 rounded-lg p-6 mb-6 ${RISK_LEVEL_STYLES[riskLevelValue] || ''}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
          {profile.role && (
            <div>
              <span className="text-gray-500">Profile: </span>
              <span>{profile.role} | {profile.risk_category}{profile.gpai_flag ? ' | GPAI' : ''} | {profile.deployment_status}</span>
            </div>
          )}
          {data.generated_at && (
            <div>
              <span className="text-gray-500">Generated: </span>
              <span>{data.generated_at.slice(0, 16).replace('T', ' ')}</span>
            </div>
          )}
          {assessmentKb && (
            <div>
              <span className="text-gray-500">KB: </span>
              <span>v{assessmentKb}</span>
            </div>
          )}
        </div>

        {/* Framework summary */}
        {Object.keys(frameworkSummary).length > 0 && (
          <div className="mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="py-2">Framework</th>
                  <th className="py-2">PASS</th>
                  <th className="py-2">REVIEW</th>
                  <th className="py-2">FAIL</th>
                  <th className="py-2">CRITICAL</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(frameworkSummary).map(([fw, counts]) => (
                  <tr key={fw} className="border-t border-gray-200">
                    <td className="py-2 font-medium">{FRAMEWORK_NAMES[fw] || fw}</td>
                    <td className="py-2 text-green-700">{counts.pass}/{counts.total}</td>
                    <td className="py-2 text-yellow-700">{counts.review}</td>
                    <td className="py-2 text-red-700">{counts.fail}</td>
                    <td className="py-2 text-red-700 font-bold">{counts.critical || '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Risk level */}
        <div className="text-center pt-4 border-t border-current/20">
          <div className="text-sm text-gray-500">Overall Risk Level</div>
          <div className="text-3xl font-bold mt-1">{riskLevelValue}</div>
          {riskMessage && <p className="text-sm mt-1">{riskMessage}</p>}
        </div>
      </div>

      {/* Metric results */}
      {metricResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Metric Results</h2>
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
                {metricResults.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="py-2 px-3">{r.label}</td>
                    <td className="py-2 px-3 font-mono text-xs">{r.value !== null && r.value !== undefined ? String(r.value) : '\u2014'}</td>
                    <td className="py-2 px-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Process results */}
      {processResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Governance & Process</h2>
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
                {processResults.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="py-2 px-3">{r.label}</td>
                    <td className="py-2 px-3 text-xs">{r.value || '\u2014'}</td>
                    <td className="py-2 px-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Human oversight */}
      {oversightResult && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Human Oversight</h2>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm">
                Weighted Score: {((oversightResult.value || 0) * 100).toFixed(0)}%
              </span>
              <StatusBadge status={oversightResult.status} />
            </div>
            {oversightResult.message && (
              <p className="text-sm text-red-700 mt-2">{oversightResult.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Action items */}
      {Object.keys(actionItems).length > 0 && !Object.values(actionItems).every((items) => items.length === 0) && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Action Items</h2>
          <div className="space-y-4">
            {Object.entries(actionItems).map(([urgency, items]) => {
              if (!items || items.length === 0) return null;
              const style = URGENCY_LEVEL_STYLES[urgency] || URGENCY_LEVEL_STYLES.MEDIUM;
              return (
                <div key={urgency} className={`border ${style.border} rounded-lg overflow-hidden`}>
                  <div className={`px-4 py-2 ${style.bg} ${style.text} text-sm font-semibold`}>
                    {urgency} ({items.length})
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <li key={item.id} className="px-4 py-3">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-sm text-gray-600 mt-0.5">{item.action}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6 text-center">
        <Link to="/" className="text-sm text-blue-600 hover:text-blue-800">{t.back_home}</Link>
      </div>
    </main>
  );
}
