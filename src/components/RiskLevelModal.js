import Modal from './Modal';

export default function RiskLevelModal({ onClose }) {
  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">How is the risk level calculated?</h2>
      <div className="text-sm text-gray-700 space-y-3">
        <p>
          The overall risk level is determined by the number and severity of issues
          found across all required metrics for your profile.
        </p>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="font-bold text-red-700 w-24 shrink-0">CRITICAL</span>
            <span>One or more critical failures detected. Deployment is not permitted until resolved.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-orange-600 w-24 shrink-0">HIGH</span>
            <span>30% or more of required metrics failed, or 2+ critical cross-metric warnings. Significant gaps require attention before deployment.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-yellow-600 w-24 shrink-0">MEDIUM</span>
            <span>Fail rate below 30% but 20% or more of required metrics need review. A compliance professional review is recommended.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-600 w-24 shrink-0">LOW</span>
            <span>Profile shows a good baseline. Periodic reassessment is recommended.</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 border-t pt-3">
          GapSight default, not a regulatory requirement. These thresholds are informational only.
        </p>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
