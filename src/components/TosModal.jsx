import en from '../locales/en.json';
import Modal from './Modal';

export default function TosModal({ onAccept, onExit }) {
  return (
    <Modal labelId="tos-modal-title">
      <h2 id="tos-modal-title" className="text-xl font-bold mb-4">{en.tos.title}</h2>
      <div className="space-y-4 text-sm text-gray-700 max-h-96 overflow-y-auto">
        <p>{en.tos.definition}</p>
        <p>{en.tos.liability}</p>
        <p>{en.tos.user_responsibility}</p>
        <p>{en.tos.kb_currency}</p>
        <p>{en.tos.language}</p>
        <p className="text-xs text-gray-400 mt-4">{en.tos.version_label}</p>
      </div>
      <div className="mt-6 flex gap-3 justify-end">
        <button
          onClick={onExit}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Exit
        </button>
        <button
          onClick={onAccept}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {en.tos.accept_button}
        </button>
      </div>
    </Modal>
  );
}
