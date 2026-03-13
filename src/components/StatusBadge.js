/**
 * Renders a colored badge for a metric or process status.
 *
 * @param {{ status: string }} props
 * @param {string} props.status - One of PASS, REVIEW, FAIL, CRITICAL_FAIL, NOT_APPLICABLE, PROCESS_REQUIRED
 * @returns {JSX.Element}
 */
import { STATUS_BADGE_STYLES, STATUS_BADGE_LABELS } from '../logic/constants';

export default function StatusBadge({ status }) {
  const label = STATUS_BADGE_LABELS[status] || status;
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.FAIL}`}>
      {label}
    </span>
  );
}
