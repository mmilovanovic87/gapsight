import en from '../locales/en.json';
import Modal from './Modal';

const t = en.risk_level_modal;

export default function RiskLevelModal({ onClose }) {
  return (
    <Modal onClose={onClose} labelId="risk-level-modal-title">
      <h2 id="risk-level-modal-title" className="text-xl font-bold mb-4">{t.title}</h2>
      <div className="text-sm text-gray-700 space-y-3">
        <p>{t.description}</p>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="font-bold text-red-700 w-24 shrink-0">CRITICAL</span>
            <span>{t.critical}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-orange-600 w-24 shrink-0">HIGH</span>
            <span>{t.high}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-yellow-600 w-24 shrink-0">MEDIUM</span>
            <span>{t.medium}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-600 w-24 shrink-0">LOW</span>
            <span>{t.low}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 border-t pt-3">
          {t.disclaimer}
        </p>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          {t.close}
        </button>
      </div>
    </Modal>
  );
}
