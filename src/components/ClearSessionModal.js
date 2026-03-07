import en from '../locales/en.json';
import Modal from './Modal';

export default function ClearSessionModal({ onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel}>
      <h2 className="text-xl font-bold mb-4">{en.clear_session_modal.title}</h2>
      <p className="text-sm text-gray-700">{en.clear_session_modal.body}</p>
      <div className="mt-6 flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          {en.clear_session_modal.cancel_button}
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          {en.clear_session_modal.confirm_button}
        </button>
      </div>
    </Modal>
  );
}
