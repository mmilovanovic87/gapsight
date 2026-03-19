import en from '../locales/en.json';
import Modal from './Modal';

export default function InlineDisclaimerModal({ onConfirm }) {
  return (
    <Modal labelId="inline-disclaimer-modal-title">
      <h2 id="inline-disclaimer-modal-title" className="text-xl font-bold mb-4">{en.inline_disclaimer.title}</h2>
      <p className="text-sm text-gray-700">{en.inline_disclaimer.body}</p>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {en.inline_disclaimer.confirm_button}
        </button>
      </div>
    </Modal>
  );
}
