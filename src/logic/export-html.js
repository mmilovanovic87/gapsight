import kbChangelog from '../data/kb-changelog.json';
import en from '../locales/en.json';

const RISK_COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#ca8a04',
  LOW: '#16a34a',
};

const STATUS_BADGES = {
  PASS: { bg: '#dcfce7', color: '#166534', label: 'PASS' },
  REVIEW: { bg: '#fef9c3', color: '#854d0e', label: 'REVIEW' },
  FAIL: { bg: '#fee2e2', color: '#991b1b', label: 'FAIL' },
  CRITICAL_FAIL: { bg: '#fee2e2', color: '#991b1b', label: 'CRITICAL' },
  NOT_APPLICABLE: { bg: '#f3f4f6', color: '#6b7280', label: 'N/A' },
  PROCESS_REQUIRED: { bg: '#fef9c3', color: '#854d0e', label: 'REVIEW' },
};

function badge(status) {
  const s = STATUS_BADGES[status] || STATUS_BADGES.FAIL;
  return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;background:${s.bg};color:${s.color}">${s.label}</span>`;
}

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Generates an HTML export of the assessment results.
 *
 * Includes disclaimer header and canonical reference note.
 * Contains all required_in_exports phrases from language policy.
 */
export function generateHtmlExport(results, session) {
  const kb = kbChangelog;
  const riskColor = RISK_COLORS[results.riskLevel.level] || '#6b7280';

  // Cross-metric warnings HTML
  let warningsHtml = '';
  if (results.crossMetricWarnings.length > 0) {
    const warningItems = results.crossMetricWarnings.map((w) => {
      const icon = w.severity === 'CRITICAL' ? '&#9940;' : '&#9888;';
      const bg = w.severity === 'CRITICAL' ? '#fee2e2' : '#fef9c3';
      const color = w.severity === 'CRITICAL' ? '#991b1b' : '#854d0e';
      return `<div style="padding:10px 14px;background:${bg};color:${color};border-radius:6px;margin-bottom:6px;font-size:13px">${icon} <strong>${esc(w.severity)}</strong>: ${esc(w.message)}</div>`;
    }).join('\n');
    warningsHtml = `<div style="margin-bottom:24px"><h2 style="font-size:16px;margin-bottom:10px">Cross-Metric Warnings</h2>${warningItems}</div>`;
  }

  // Framework summary HTML
  const fwNames = { eu_ai_act: 'EU AI Act', nist_ai_rmf: 'NIST RMF', iso_42001: 'ISO 42001' };
  const fwRows = Object.entries(results.frameworkSummary).map(([fw, counts]) =>
    `<tr><td style="padding:6px 12px;font-weight:600">${fwNames[fw] || fw}</td><td style="padding:6px 12px;color:#166534">${counts.pass}/${counts.total} PASS</td><td style="padding:6px 12px;color:#854d0e">${counts.review} REVIEW</td><td style="padding:6px 12px;color:#991b1b">${counts.fail} FAIL</td>${counts.critical > 0 ? `<td style="padding:6px 12px;color:#991b1b;font-weight:700">${counts.critical} CRITICAL</td>` : '<td></td>'}</tr>`
  ).join('\n');

  // Metric results HTML
  const metricRows = results.metricResults.map((r) =>
    `<tr><td style="padding:6px 12px">${esc(r.label)}</td><td style="padding:6px 12px">${r.value !== null && r.value !== undefined ? esc(String(r.value)) : '—'}</td><td style="padding:6px 12px">${badge(r.status)}</td></tr>`
  ).join('\n');

  // Process results HTML
  const processRows = results.processResults.map((r) =>
    `<tr><td style="padding:6px 12px">${esc(r.label)}</td><td style="padding:6px 12px">${r.value ? esc(r.value) : '—'}</td><td style="padding:6px 12px">${badge(r.status)}</td></tr>`
  ).join('\n');

  // Action items HTML
  const urgencyLabels = { CRITICAL: 'Critical — Before Deployment', HIGH: 'High Priority — Within 30 Days', MEDIUM: 'Medium Priority — Within 90 Days', ONGOING: 'Ongoing' };
  const urgencyColors = { CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#ca8a04', ONGOING: '#2563eb' };
  let actionHtml = '';
  for (const [urgency, items] of Object.entries(results.actionItems)) {
    if (items.length === 0) continue;
    const itemsHtml = items.map((item) =>
      `<li style="margin-bottom:8px"><strong>${esc(item.label)}</strong>: ${esc(item.action)}${item.frameworks && item.frameworks.length > 0 ? `<br><span style="font-size:11px;color:#6b7280">${item.frameworks.map(esc).join(', ')}</span>` : ''}</li>`
    ).join('\n');
    actionHtml += `<div style="margin-bottom:16px"><h3 style="font-size:14px;color:${urgencyColors[urgency]};margin-bottom:8px">${urgencyLabels[urgency]}</h3><ul style="margin:0;padding-left:20px;font-size:13px">${itemsHtml}</ul></div>`;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GapSight Assessment Report</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:0;padding:0;color:#1f2937;background:#f9fafb}table{border-collapse:collapse;width:100%}th,td{text-align:left;border-bottom:1px solid #e5e7eb}th{background:#f3f4f6;font-size:12px;text-transform:uppercase;color:#6b7280;padding:8px 12px}@media print{.no-print{display:none}body{background:#fff}}</style>
</head>
<body>
<div style="background:#fef3c7;padding:12px 24px;font-size:13px;color:#92400e;border-bottom:2px solid #f59e0b">
${esc(en.exports.disclaimer)}
</div>
<div style="max-width:800px;margin:0 auto;padding:32px 24px">

<h1 style="font-size:24px;margin-bottom:4px">GapSight Assessment Report</h1>
<p style="color:#6b7280;font-size:13px;margin-top:0">${esc(en.exports.canonical_note)}</p>

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0">
<table style="border:none"><tbody>
<tr><td style="border:none;padding:4px 12px;color:#6b7280;width:160px">Profile</td><td style="border:none;padding:4px 12px">${esc(results.profile.role)} | ${esc(results.profile.risk_category)}${results.profile.gpai_flag ? ' | GPAI' : ''} | ${esc(results.profile.deployment_status)}</td></tr>
<tr><td style="border:none;padding:4px 12px;color:#6b7280">Generated</td><td style="border:none;padding:4px 12px">${esc(results.generatedAt)}</td></tr>
<tr><td style="border:none;padding:4px 12px;color:#6b7280">KB Version</td><td style="border:none;padding:4px 12px">v${esc(kb.current_version)} | ${esc(kb.versions[0].date)}</td></tr>
<tr><td style="border:none;padding:4px 12px;color:#6b7280">Assessment ID</td><td style="border:none;padding:4px 12px;font-family:monospace;font-size:12px">${esc(session?.assessment_id || 'N/A')}</td></tr>
<tr><td style="border:none;padding:4px 12px;color:#6b7280">Thresholds</td><td style="border:none;padding:4px 12px;font-style:italic;font-size:12px">GapSight defaults, not regulatory requirements</td></tr>
</tbody></table>
</div>

<div style="background:#fff;border:2px solid ${riskColor};border-radius:8px;padding:20px;margin-bottom:24px;text-align:center">
<div style="font-size:14px;color:#6b7280;margin-bottom:4px">Overall Risk Level</div>
<div style="font-size:28px;font-weight:700;color:${riskColor}">${esc(results.riskLevel.level)}</div>
<div style="font-size:13px;color:#4b5563;margin-top:4px">${esc(results.riskLevel.message)}</div>
</div>

${warningsHtml}

<h2 style="font-size:16px;margin-bottom:10px">Framework Summary</h2>
<table><thead><tr><th>Framework</th><th>Pass</th><th>Review</th><th>Fail</th><th>Critical</th></tr></thead><tbody>${fwRows}</tbody></table>

<h2 style="font-size:16px;margin:24px 0 10px">Metric Results</h2>
<table><thead><tr><th>Metric</th><th>Value</th><th>Status</th></tr></thead><tbody>${metricRows}</tbody></table>

<h2 style="font-size:16px;margin:24px 0 10px">Governance &amp; Process</h2>
<table><thead><tr><th>Requirement</th><th>Status Value</th><th>Result</th></tr></thead><tbody>${processRows}</tbody></table>

${results.oversightResult ? `
<h2 style="font-size:16px;margin:24px 0 10px">Human Oversight</h2>
<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px">
<p>Weighted Score: <strong>${(results.oversightResult.value * 100).toFixed(0)}%</strong> — ${badge(results.oversightResult.status)}</p>
${results.oversightResult.message ? `<p style="color:#991b1b;font-size:13px">${esc(results.oversightResult.message)}</p>` : ''}
</div>
` : ''}

<h2 style="font-size:16px;margin:24px 0 10px">Action Items</h2>
${actionHtml || '<p style="color:#6b7280;font-size:13px">No action items generated.</p>'}

<div style="margin-top:40px;padding-top:16px;border-top:2px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center">
<p>This report is an informative self-assessment. It is not legal advice and not a compliance certificate.</p>
<p>${esc(en.exports.canonical_note)}</p>
<p>KB v${esc(kb.current_version)} | ${esc(kb.versions[0].date)} &mdash; &copy; 2026 GapSight</p>
</div>

</div>
</body>
</html>`;

  return html;
}

/**
 * Triggers a file download of the HTML export.
 */
export function downloadHtmlExport(results, session) {
  const html = generateHtmlExport(results, session);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gapsight-assessment-${results.generatedAt.slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
