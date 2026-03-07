import kbChangelog from '../data/kb-changelog.json';
import en from '../locales/en.json';

const COLORS = {
  CRITICAL: [220, 38, 38],
  HIGH: [234, 88, 12],
  MEDIUM: [202, 138, 4],
  LOW: [22, 163, 74],
  ONGOING: [37, 99, 235],
};

const STATUS_COLORS = {
  PASS: [22, 101, 52],
  REVIEW: [133, 77, 14],
  FAIL: [153, 27, 27],
  CRITICAL_FAIL: [153, 27, 27],
  NOT_APPLICABLE: [107, 114, 128],
  PROCESS_REQUIRED: [133, 77, 14],
};

const STATUS_LABELS = {
  PASS: 'PASS',
  REVIEW: 'REVIEW',
  FAIL: 'FAIL',
  CRITICAL_FAIL: 'CRITICAL',
  NOT_APPLICABLE: 'N/A',
  PROCESS_REQUIRED: 'REVIEW',
};

const URGENCY_LABELS = {
  CRITICAL: 'Critical: Before Deployment',
  HIGH: 'High Priority: Within 30 Days',
  MEDIUM: 'Medium Priority: Within 90 Days',
  ONGOING: 'Ongoing',
};

const FW_NAMES = { eu_ai_act: 'EU AI Act', nist_ai_rmf: 'NIST RMF', iso_42001: 'ISO 42001' };

const PAGE_WIDTH = 210;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function checkPage(doc, y, needed = 20) {
  if (y + needed > 277) {
    doc.addPage();
    return 20;
  }
  return y;
}

function drawLine(doc, y) {
  doc.setDrawColor(229, 231, 235);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
}

/**
 * Generates and downloads a PDF export of assessment results.
 *
 * This is an informative self-assessment report, not legal advice
 * and not a compliance certificate.
 */
export async function downloadPdfExport(results, session) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const kb = kbChangelog;
  const assessmentId = session?.assessment_id || 'N/A';
  const dateStr = results.generatedAt.slice(0, 10);

  // --- Disclaimer header ---
  doc.setFillColor(254, 243, 199);
  doc.rect(0, 0, PAGE_WIDTH, 16, 'F');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text(en.exports.disclaimer, PAGE_WIDTH / 2, 10, { align: 'center', maxWidth: CONTENT_WIDTH });

  // --- Title ---
  let y = 26;
  doc.setFontSize(20);
  doc.setTextColor(31, 41, 55);
  doc.setFont(undefined, 'bold');
  doc.text('GapSight Assessment Report', MARGIN, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont(undefined, 'normal');
  doc.text(en.exports.canonical_note, MARGIN, y);

  // --- Profile box ---
  y += 8;
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 36, 2, 2, 'FD');
  y += 7;
  doc.setFontSize(9);
  const profileLines = [
    ['Profile', `${results.profile.role} | ${results.profile.risk_category}${results.profile.gpai_flag ? ' | GPAI' : ''} | ${results.profile.deployment_status}`],
    ['Generated', results.generatedAt],
    ['KB Version', `v${kb.current_version} | ${kb.versions[0].date}`],
    ['Assessment ID', assessmentId],
    ['Thresholds', 'GapSight defaults, not regulatory requirements'],
  ];
  for (const [label, value] of profileLines) {
    doc.setTextColor(107, 114, 128);
    doc.setFont(undefined, 'normal');
    doc.text(label, MARGIN + 4, y);
    doc.setTextColor(31, 41, 55);
    doc.text(value, MARGIN + 40, y);
    y += 5.5;
  }
  y += 4;

  // --- Risk level ---
  y = checkPage(doc, y, 30);
  const riskColor = COLORS[results.riskLevel.level] || [107, 114, 128];
  doc.setDrawColor(...riskColor);
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 24, 2, 2, 'D');
  doc.setLineWidth(0.2);
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('Overall Risk Level', PAGE_WIDTH / 2, y + 7, { align: 'center' });
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...riskColor);
  doc.text(results.riskLevel.level, PAGE_WIDTH / 2, y + 16, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(results.riskLevel.message, PAGE_WIDTH / 2, y + 22, { align: 'center', maxWidth: CONTENT_WIDTH - 10 });
  y += 30;

  // --- Cross-metric warnings ---
  if (results.crossMetricWarnings.length > 0) {
    y = checkPage(doc, y, 20);
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Cross-Metric Warnings', MARGIN, y);
    y += 6;
    for (const w of results.crossMetricWarnings) {
      y = checkPage(doc, y, 12);
      const isCrit = w.severity === 'CRITICAL';
      doc.setFillColor(isCrit ? 254 : 254, isCrit ? 226 : 249, isCrit ? 226 : 195);
      doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 10, 1, 1, 'F');
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(isCrit ? 153 : 133, isCrit ? 27 : 77, isCrit ? 27 : 14);
      doc.text(`${w.severity}: `, MARGIN + 3, y + 1);
      doc.setFont(undefined, 'normal');
      const sevWidth = doc.getTextWidth(`${w.severity}: `);
      doc.text(w.message, MARGIN + 3 + sevWidth, y + 1, { maxWidth: CONTENT_WIDTH - 8 - sevWidth });
      y += 12;
    }
    y += 4;
  }

  // --- Framework summary table ---
  y = checkPage(doc, y, 30);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Framework Summary', MARGIN, y);
  y += 6;

  // Header
  doc.setFillColor(243, 244, 246);
  doc.rect(MARGIN, y - 3.5, CONTENT_WIDTH, 7, 'F');
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(107, 114, 128);
  const fwCols = [MARGIN + 2, MARGIN + 55, MARGIN + 85, MARGIN + 110, MARGIN + 135];
  doc.text('FRAMEWORK', fwCols[0], y);
  doc.text('PASS', fwCols[1], y);
  doc.text('REVIEW', fwCols[2], y);
  doc.text('FAIL', fwCols[3], y);
  doc.text('CRITICAL', fwCols[4], y);
  y += 5;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  for (const [fw, counts] of Object.entries(results.frameworkSummary)) {
    y = checkPage(doc, y, 8);
    doc.setTextColor(31, 41, 55);
    doc.setFont(undefined, 'bold');
    doc.text(FW_NAMES[fw] || fw, fwCols[0], y);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(22, 101, 52);
    doc.text(`${counts.pass}/${counts.total}`, fwCols[1], y);
    doc.setTextColor(133, 77, 14);
    doc.text(String(counts.review), fwCols[2], y);
    doc.setTextColor(153, 27, 27);
    doc.text(String(counts.fail), fwCols[3], y);
    if (counts.critical > 0) {
      doc.setFont(undefined, 'bold');
      doc.text(String(counts.critical), fwCols[4], y);
    }
    y += 6;
    drawLine(doc, y - 2);
  }
  y += 6;

  // --- Metric results table ---
  y = checkPage(doc, y, 25);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Metric Results', MARGIN, y);
  y += 6;

  doc.setFillColor(243, 244, 246);
  doc.rect(MARGIN, y - 3.5, CONTENT_WIDTH, 7, 'F');
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(107, 114, 128);
  doc.text('METRIC', MARGIN + 2, y);
  doc.text('VALUE', MARGIN + 95, y);
  doc.text('STATUS', MARGIN + 130, y);
  y += 5;

  doc.setFontSize(8);
  for (const r of results.metricResults) {
    y = checkPage(doc, y, 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(31, 41, 55);
    doc.text(r.label, MARGIN + 2, y, { maxWidth: 90 });
    doc.text(r.value !== null && r.value !== undefined ? String(r.value) : '\u2014', MARGIN + 95, y);
    const sc = STATUS_COLORS[r.status] || [107, 114, 128];
    doc.setTextColor(...sc);
    doc.setFont(undefined, 'bold');
    doc.text(STATUS_LABELS[r.status] || r.status, MARGIN + 130, y);
    y += 6;
    drawLine(doc, y - 2);
  }
  y += 6;

  // --- Process results table ---
  y = checkPage(doc, y, 25);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Governance & Process', MARGIN, y);
  y += 6;

  doc.setFillColor(243, 244, 246);
  doc.rect(MARGIN, y - 3.5, CONTENT_WIDTH, 7, 'F');
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(107, 114, 128);
  doc.text('REQUIREMENT', MARGIN + 2, y);
  doc.text('STATUS', MARGIN + 95, y);
  doc.text('RESULT', MARGIN + 130, y);
  y += 5;

  doc.setFontSize(8);
  for (const r of results.processResults) {
    y = checkPage(doc, y, 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(31, 41, 55);
    doc.text(r.label, MARGIN + 2, y, { maxWidth: 90 });
    doc.text(r.value || '\u2014', MARGIN + 95, y);
    const sc = STATUS_COLORS[r.status] || [107, 114, 128];
    doc.setTextColor(...sc);
    doc.setFont(undefined, 'bold');
    doc.text(STATUS_LABELS[r.status] || r.status, MARGIN + 130, y);
    y += 6;
    drawLine(doc, y - 2);
  }
  y += 6;

  // --- Human oversight ---
  if (results.oversightResult) {
    y = checkPage(doc, y, 20);
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Human Oversight', MARGIN, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(31, 41, 55);
    doc.text(`Weighted Score: ${(results.oversightResult.value * 100).toFixed(0)}%`, MARGIN + 2, y);
    const sc = STATUS_COLORS[results.oversightResult.status] || [107, 114, 128];
    doc.setTextColor(...sc);
    doc.setFont(undefined, 'bold');
    doc.text(STATUS_LABELS[results.oversightResult.status], MARGIN + 60, y);
    y += 5;
    if (results.oversightResult.message) {
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(153, 27, 27);
      const msgLines = doc.splitTextToSize(results.oversightResult.message, CONTENT_WIDTH - 4);
      y = checkPage(doc, y, msgLines.length * 4 + 2);
      doc.text(msgLines, MARGIN + 2, y);
      y += msgLines.length * 4;
    }
    y += 6;
  }

  // --- Action items with remediation ---
  y = checkPage(doc, y, 20);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Action Items', MARGIN, y);
  y += 7;

  let hasActions = false;
  for (const [urgency, items] of Object.entries(results.actionItems)) {
    if (items.length === 0) continue;
    hasActions = true;
    y = checkPage(doc, y, 14);
    const uColor = COLORS[urgency] || [107, 114, 128];
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...uColor);
    doc.text(URGENCY_LABELS[urgency], MARGIN, y);
    y += 5;

    for (const item of items) {
      y = checkPage(doc, y, 14);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(item.label, MARGIN + 2, y);
      y += 4;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(75, 85, 99);
      const actionLines = doc.splitTextToSize(item.action, CONTENT_WIDTH - 6);
      y = checkPage(doc, y, actionLines.length * 3.5 + 2);
      doc.text(actionLines, MARGIN + 4, y);
      y += actionLines.length * 3.5;

      if (item.frameworks && item.frameworks.length > 0) {
        y += 1;
        doc.setFontSize(7);
        doc.setTextColor(156, 163, 175);
        doc.text(item.frameworks.join(', '), MARGIN + 4, y, { maxWidth: CONTENT_WIDTH - 8 });
        y += 3.5;
      }

      // Remediation detail
      if (item.remediation) {
        const rem = item.remediation;
        y += 1;
        y = checkPage(doc, y, 20);

        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('How to fix:', MARGIN + 6, y);
        y += 3.5;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(75, 85, 99);
        rem.how.forEach((step, i) => {
          const stepLines = doc.splitTextToSize(`${i + 1}. ${step}`, CONTENT_WIDTH - 14);
          y = checkPage(doc, y, stepLines.length * 3 + 1);
          doc.text(stepLines, MARGIN + 8, y);
          y += stepLines.length * 3 + 1;
        });

        if (rem.tools && rem.tools.length > 0) {
          y = checkPage(doc, y, 6);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(31, 41, 55);
          doc.text('Tools:', MARGIN + 6, y);
          y += 3.5;
          doc.setFont(undefined, 'normal');
          doc.setTextColor(75, 85, 99);
          for (const tool of rem.tools) {
            const toolLine = `${tool.name} - ${tool.url}`;
            const toolLines = doc.splitTextToSize(toolLine, CONTENT_WIDTH - 16);
            y = checkPage(doc, y, toolLines.length * 3 + 1);
            doc.text(toolLines, MARGIN + 8, y);
            y += toolLines.length * 3 + 1;
          }
        }

        y = checkPage(doc, y, 8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('Estimated effort: ', MARGIN + 6, y);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text(rem.estimated_effort, MARGIN + 6 + doc.getTextWidth('Estimated effort: '), y);
        y += 4;

        y = checkPage(doc, y, 6);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('Documentation required:', MARGIN + 6, y);
        y += 3.5;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(75, 85, 99);
        const docLines = doc.splitTextToSize(rem.documentation_required, CONTENT_WIDTH - 14);
        y = checkPage(doc, y, docLines.length * 3 + 2);
        doc.text(docLines, MARGIN + 8, y);
        y += docLines.length * 3 + 2;
      } else {
        y += 1;
        doc.setFontSize(7);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(156, 163, 175);
        doc.text('No additional guidance available.', MARGIN + 6, y);
        y += 4;
      }

      y += 3;
      drawLine(doc, y - 1);
      y += 2;
    }
    y += 4;
  }

  if (!hasActions) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('No action items generated.', MARGIN + 2, y);
    y += 8;
  }

  // --- Footer disclaimer ---
  y = checkPage(doc, y, 25);
  y += 4;
  drawLine(doc, y);
  y += 6;
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text('This report is an informative self-assessment. It is not legal advice and not a compliance certificate.', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 4;
  doc.text(en.exports.canonical_note, PAGE_WIDTH / 2, y, { align: 'center', maxWidth: CONTENT_WIDTH });
  y += 4;
  doc.text(`KB v${kb.current_version} | ${kb.versions[0].date} | © 2026 GapSight`, PAGE_WIDTH / 2, y, { align: 'center' });

  // Save
  doc.save(`gapsight-assessment-${assessmentId}-${dateStr}.pdf`);
}
