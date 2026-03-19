import kbChangelog from '../data/kb-changelog.json';
import en from '../locales/en.json';
import {
  RISK_COLORS_RGB,
  STATUS_COLORS_RGB,
  STATUS_BADGE_LABELS,
  URGENCY_LABELS_EXPORT,
  FRAMEWORK_NAMES,
  PDF_PAGE_WIDTH,
  PDF_MARGIN,
  PDF_CONTENT_WIDTH,
  PDF_PAGE_BREAK_Y,
} from './constants';

/**
 * Checks if content fits on the current page; adds a new page if not.
 *
 * @param {object} doc - jsPDF document instance
 * @param {number} y - Current Y position in mm
 * @param {number} [needed=20] - Minimum space needed in mm
 * @returns {number} Updated Y position (reset to margin if new page added)
 */
function checkPage(doc, y, needed = 20) {
  if (y + needed > PDF_PAGE_BREAK_Y) {
    doc.addPage();
    return PDF_MARGIN;
  }
  return y;
}

/**
 * Draws a horizontal separator line at the given Y position.
 *
 * @param {object} doc - jsPDF document instance
 * @param {number} y - Y position in mm
 */
function drawLine(doc, y) {
  doc.setDrawColor(229, 231, 235);
  doc.line(PDF_MARGIN, y, PDF_PAGE_WIDTH - PDF_MARGIN, y);
}

/**
 * Generates and downloads a PDF export of assessment results.
 *
 * This is an informative self-assessment report, not legal advice
 * and not a compliance certificate.
 *
 * Layout approach: The PDF is built top-to-bottom using a `y` cursor variable
 * that tracks the current vertical position in mm. Each section advances `y`
 * by its rendered height. checkPage() handles page breaks by comparing `y`
 * against PDF_PAGE_BREAK_Y and inserting a new page when needed.
 *
 * Sections rendered in order:
 *   1. Disclaimer header (fixed yellow bar)
 *   2. Title and canonical note
 *   3. Profile info box (role, risk, frameworks, assessment ID)
 *   4. Risk level panel (colored box)
 *   5. Cross-metric warnings (if any)
 *   6. Framework summary table
 *   7. Metric results table
 *   8. Governance & Process table
 *   9. Human oversight score (if present)
 *  10. Action items grouped by urgency
 *  11. Footer with version info
 */
export async function downloadPdfExport(results, session) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const kb = kbChangelog;
  const assessmentId = session?.assessment_id || 'N/A';
  const dateStr = results.generatedAt.slice(0, 10);

  // --- Disclaimer header ---
  doc.setFillColor(254, 243, 199);
  doc.rect(0, 0, PDF_PAGE_WIDTH, 16, 'F');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text(en.exports.disclaimer, PDF_PAGE_WIDTH / 2, 10, { align: 'center', maxWidth: PDF_CONTENT_WIDTH });

  // --- Title ---
  let y = 26;
  doc.setFontSize(20);
  doc.setTextColor(31, 41, 55);
  doc.setFont(undefined, 'bold');
  doc.text('GapSight Assessment Report', PDF_MARGIN, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont(undefined, 'normal');
  doc.text(en.exports.canonical_note, PDF_MARGIN, y);

  // --- Profile box ---
  y += 8;
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(PDF_MARGIN, y, PDF_CONTENT_WIDTH, 36, 2, 2, 'FD');
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
    doc.text(label, PDF_MARGIN + 4, y);
    doc.setTextColor(31, 41, 55);
    doc.text(value, PDF_MARGIN + 40, y);
    y += 5.5;
  }
  y += 4;

  // --- Risk level ---
  y = checkPage(doc, y, 30);
  const riskColor = RISK_COLORS_RGB[results.riskLevel.level] || [107, 114, 128];
  doc.setDrawColor(...riskColor);
  doc.setLineWidth(0.8);
  doc.roundedRect(PDF_MARGIN, y, PDF_CONTENT_WIDTH, 24, 2, 2, 'D');
  doc.setLineWidth(0.2);
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('Overall Risk Level', PDF_PAGE_WIDTH / 2, y + 7, { align: 'center' });
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...riskColor);
  doc.text(results.riskLevel.level, PDF_PAGE_WIDTH / 2, y + 16, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(results.riskLevel.message, PDF_PAGE_WIDTH / 2, y + 22, { align: 'center', maxWidth: PDF_CONTENT_WIDTH - 10 });
  y += 30;

  // --- Cross-metric warnings ---
  if (results.crossMetricWarnings.length > 0) {
    y = checkPage(doc, y, 20);
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Cross-Metric Warnings', PDF_MARGIN, y);
    y += 6;
    for (const w of results.crossMetricWarnings) {
      y = checkPage(doc, y, 12);
      const isCrit = w.severity === 'CRITICAL';
      doc.setFillColor(isCrit ? 254 : 254, isCrit ? 226 : 249, isCrit ? 226 : 195);
      doc.roundedRect(PDF_MARGIN, y - 4, PDF_CONTENT_WIDTH, 10, 1, 1, 'F');
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(isCrit ? 153 : 133, isCrit ? 27 : 77, isCrit ? 27 : 14);
      doc.text(`${w.severity}: `, PDF_MARGIN + 3, y + 1);
      doc.setFont(undefined, 'normal');
      const sevWidth = doc.getTextWidth(`${w.severity}: `);
      doc.text(w.message, PDF_MARGIN + 3 + sevWidth, y + 1, { maxWidth: PDF_CONTENT_WIDTH - 8 - sevWidth });
      y += 12;
    }
    y += 4;
  }

  // --- Framework summary table ---
  y = checkPage(doc, y, 30);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Framework Summary', PDF_MARGIN, y);
  y += 6;

  // Header
  doc.setFillColor(243, 244, 246);
  doc.rect(PDF_MARGIN, y - 3.5, PDF_CONTENT_WIDTH, 7, 'F');
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(107, 114, 128);
  const fwCols = [PDF_MARGIN + 2, PDF_MARGIN + 55, PDF_MARGIN + 85, PDF_MARGIN + 110, PDF_MARGIN + 135];
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
    doc.text(FRAMEWORK_NAMES[fw] || fw, fwCols[0], y);
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
  doc.text('Metric Results', PDF_MARGIN, y);
  y += 6;

  doc.setFillColor(243, 244, 246);
  doc.rect(PDF_MARGIN, y - 3.5, PDF_CONTENT_WIDTH, 7, 'F');
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(107, 114, 128);
  doc.text('METRIC', PDF_MARGIN + 2, y);
  doc.text('VALUE', PDF_MARGIN + 95, y);
  doc.text('STATUS', PDF_MARGIN + 130, y);
  y += 5;

  doc.setFontSize(8);
  for (const r of results.metricResults) {
    y = checkPage(doc, y, 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(31, 41, 55);
    doc.text(r.label, PDF_MARGIN + 2, y, { maxWidth: 90 });
    doc.text(r.value !== null && r.value !== undefined ? String(r.value) : '\u2014', PDF_MARGIN + 95, y);
    const sc = STATUS_COLORS_RGB[r.status] || [107, 114, 128];
    doc.setTextColor(...sc);
    doc.setFont(undefined, 'bold');
    doc.text(STATUS_BADGE_LABELS[r.status] || r.status, PDF_MARGIN + 130, y);
    y += 6;
    drawLine(doc, y - 2);
  }
  y += 6;

  // --- Process results table ---
  y = checkPage(doc, y, 25);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Governance & Process', PDF_MARGIN, y);
  y += 6;

  doc.setFillColor(243, 244, 246);
  doc.rect(PDF_MARGIN, y - 3.5, PDF_CONTENT_WIDTH, 7, 'F');
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(107, 114, 128);
  doc.text('REQUIREMENT', PDF_MARGIN + 2, y);
  doc.text('STATUS', PDF_MARGIN + 95, y);
  doc.text('RESULT', PDF_MARGIN + 130, y);
  y += 5;

  doc.setFontSize(8);
  for (const r of results.processResults) {
    y = checkPage(doc, y, 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(31, 41, 55);
    doc.text(r.label, PDF_MARGIN + 2, y, { maxWidth: 90 });
    doc.text(r.value || '\u2014', PDF_MARGIN + 95, y);
    const sc = STATUS_COLORS_RGB[r.status] || [107, 114, 128];
    doc.setTextColor(...sc);
    doc.setFont(undefined, 'bold');
    doc.text(STATUS_BADGE_LABELS[r.status] || r.status, PDF_MARGIN + 130, y);
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
    doc.text('Human Oversight', PDF_MARGIN, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(31, 41, 55);
    doc.text(`Weighted Score: ${(results.oversightResult.value * 100).toFixed(0)}%`, PDF_MARGIN + 2, y);
    const sc = STATUS_COLORS_RGB[results.oversightResult.status] || [107, 114, 128];
    doc.setTextColor(...sc);
    doc.setFont(undefined, 'bold');
    doc.text(STATUS_BADGE_LABELS[results.oversightResult.status], PDF_MARGIN + 60, y);
    y += 5;
    if (results.oversightResult.message) {
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(153, 27, 27);
      const msgLines = doc.splitTextToSize(results.oversightResult.message, PDF_CONTENT_WIDTH - 4);
      y = checkPage(doc, y, msgLines.length * 4 + 2);
      doc.text(msgLines, PDF_MARGIN + 2, y);
      y += msgLines.length * 4;
    }
    y += 6;
  }

  // --- Action items with remediation ---
  y = checkPage(doc, y, 20);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Action Items', PDF_MARGIN, y);
  y += 7;

  let hasActions = false;
  for (const [urgency, items] of Object.entries(results.actionItems)) {
    if (items.length === 0) continue;
    hasActions = true;
    y = checkPage(doc, y, 14);
    const uColor = RISK_COLORS_RGB[urgency] || [107, 114, 128];
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...uColor);
    doc.text(URGENCY_LABELS_EXPORT[urgency], PDF_MARGIN, y);
    y += 5;

    for (const item of items) {
      y = checkPage(doc, y, 14);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(item.label, PDF_MARGIN + 2, y);
      y += 4;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(75, 85, 99);
      const actionLines = doc.splitTextToSize(item.action, PDF_CONTENT_WIDTH - 6);
      y = checkPage(doc, y, actionLines.length * 3.5 + 2);
      doc.text(actionLines, PDF_MARGIN + 4, y);
      y += actionLines.length * 3.5;

      if (item.frameworks && item.frameworks.length > 0) {
        y += 1;
        doc.setFontSize(7);
        doc.setTextColor(156, 163, 175);
        doc.text(item.frameworks.join(', '), PDF_MARGIN + 4, y, { maxWidth: PDF_CONTENT_WIDTH - 8 });
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
        doc.text('How to fix:', PDF_MARGIN + 6, y);
        y += 3.5;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(75, 85, 99);
        for (let i = 0; i < rem.how.length; i++) {
          const stepLines = doc.splitTextToSize(`${i + 1}. ${rem.how[i]}`, PDF_CONTENT_WIDTH - 14);
          y = checkPage(doc, y, stepLines.length * 3 + 1);
          doc.text(stepLines, PDF_MARGIN + 8, y);
          y += stepLines.length * 3 + 1;
        }

        if (rem.tools && rem.tools.length > 0) {
          y = checkPage(doc, y, 6);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(31, 41, 55);
          doc.text('Tools:', PDF_MARGIN + 6, y);
          y += 3.5;
          doc.setFont(undefined, 'normal');
          doc.setTextColor(75, 85, 99);
          for (const tool of rem.tools) {
            const toolLine = `${tool.name} - ${tool.url}`;
            const toolLines = doc.splitTextToSize(toolLine, PDF_CONTENT_WIDTH - 16);
            y = checkPage(doc, y, toolLines.length * 3 + 1);
            doc.text(toolLines, PDF_MARGIN + 8, y);
            y += toolLines.length * 3 + 1;
          }
        }

        y = checkPage(doc, y, 8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('Estimated effort: ', PDF_MARGIN + 6, y);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text(rem.estimated_effort, PDF_MARGIN + 6 + doc.getTextWidth('Estimated effort: '), y);
        y += 4;

        y = checkPage(doc, y, 6);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('Documentation required:', PDF_MARGIN + 6, y);
        y += 3.5;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(75, 85, 99);
        const docLines = doc.splitTextToSize(rem.documentation_required, PDF_CONTENT_WIDTH - 14);
        y = checkPage(doc, y, docLines.length * 3 + 2);
        doc.text(docLines, PDF_MARGIN + 8, y);
        y += docLines.length * 3 + 2;
      } else {
        y += 1;
        doc.setFontSize(7);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(156, 163, 175);
        doc.text('No additional guidance available.', PDF_MARGIN + 6, y);
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
    doc.text('No action items generated.', PDF_MARGIN + 2, y);
    y += 8;
  }

  // --- Footer disclaimer ---
  y = checkPage(doc, y, 25);
  y += 4;
  drawLine(doc, y);
  y += 6;
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text('This report is an informative self-assessment. It is not legal advice and not a compliance certificate.', PDF_PAGE_WIDTH / 2, y, { align: 'center' });
  y += 4;
  doc.text(en.exports.canonical_note, PDF_PAGE_WIDTH / 2, y, { align: 'center', maxWidth: PDF_CONTENT_WIDTH });
  y += 4;
  doc.text(`KB v${kb.current_version} | ${kb.versions[0].date} | © 2026 GapSight`, PDF_PAGE_WIDTH / 2, y, { align: 'center' });

  // Save
  doc.save(`gapsight-assessment-${assessmentId}-${dateStr}.pdf`);
}
