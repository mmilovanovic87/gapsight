import { useState } from 'react';
import en from '../locales/en.json';
import Modal from './Modal';
import { createShareLink } from '../api/share-client';

const t = en.share;

export default function ShareModal({ assessment, onClose }) {
  const [usePin, setUsePin] = useState(true);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (usePin && (pin.length < 4 || pin.length > 8 || !/^\d+$/.test(pin))) {
      setError(t.pin_validation);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createShareLink(assessment, usePin ? pin : null);
      if (res.success) {
        setResult(res);
      } else {
        setError(res.message || t.create_error);
      }
    } catch {
      setError(t.create_error);
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = result
    ? `${window.location.origin}/shared/${result.share_id}`
    : null;

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <Modal onClose={onClose} labelId="share-modal-title">
      <h2 id="share-modal-title" className="text-xl font-bold mb-4">{t.title}</h2>

      {!result ? (
        <>
          <div className="space-y-4">
            {/* PIN toggle - default ON */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={usePin}
                  onChange={(e) => setUsePin(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-medium">{t.pin_label}</span>
              </label>
              <p className="text-xs text-gray-500 ml-6">{t.pin_description}</p>

              {usePin && (
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.pin_placeholder}
                  className="ml-6 block w-40 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              {!usePin && (
                <p className="text-xs text-amber-600 ml-6 font-medium">{t.no_pin_warning}</p>
              )}
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className={`px-4 py-2 text-sm rounded text-white ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? t.creating : t.create_button}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3">
            <p className="text-sm text-green-700 font-medium">{t.success}</p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50"
              >
                {t.copy}
              </button>
            </div>

            {result.has_pin && (
              <p className="text-xs text-gray-500">{t.pin_reminder}</p>
            )}

            <p className="text-xs text-gray-500">
              {t.expires_at.replace('{date}', new Date(result.expires_at).toLocaleDateString())}
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
        </>
      )}
    </Modal>
  );
}
