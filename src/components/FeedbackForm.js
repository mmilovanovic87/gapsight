import { useState, useRef } from 'react';
import en from '../locales/en.json';
import { submitFeedback } from '../api/feedback';

const t = en.feedback;
const DISABLE_MS = 30_000;

const ISSUE_TYPES = Object.entries(t.issue_types).map(([value, label]) => ({ value, label }));

export default function FeedbackForm() {
  const [issueType, setIssueType] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [disabled, setDisabled] = useState(false);
  const timerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issueType || description.length < 20) return;

    setStatus('loading');
    setErrorMsg('');

    // Disable button for 30 seconds after any submission attempt
    setDisabled(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDisabled(false), DISABLE_MS);

    const result = await submitFeedback({
      issue_type: issueType,
      reference,
      description,
      honeypot: '', // hidden field, always empty for real users
    });

    // Per spec: wait for server 200 before showing success (no optimistic UI)
    if (result.success) {
      setStatus('success');
      setIssueType('');
      setReference('');
      setDescription('');
    } else {
      setStatus('error');
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{t.title}</h3>

      {status === 'success' ? (
        <p className="text-sm text-green-700">{t.success_message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot - hidden from users, bots fill it */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
            aria-hidden="true"
          />

          <div>
            <label htmlFor="feedback_type" className="block text-sm font-medium text-gray-700 mb-1">
              {t.issue_type_label}
            </label>
            <select
              id="feedback_type"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">- Select -</option>
              {ISSUE_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="feedback_ref" className="block text-sm font-medium text-gray-700 mb-1">
              {t.reference_label}
            </label>
            <input
              id="feedback_ref"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t.reference_placeholder}
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="feedback_desc" className="block text-sm font-medium text-gray-700 mb-1">
              {t.description_label}
            </label>
            <textarea
              id="feedback_desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.description_placeholder}
              rows={4}
              minLength={20}
              required
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {description.length > 0 && description.length < 20 && (
              <p className="text-xs text-gray-400 mt-1">{20 - description.length} characters remaining</p>
            )}
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={disabled || status === 'loading' || !issueType || description.length < 20}
            className={`px-4 py-2 text-sm rounded text-white ${
              disabled || status === 'loading' || !issueType || description.length < 20
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {status === 'loading' ? 'Submitting...' : t.submit_button}
          </button>

          {disabled && status !== 'loading' && (
            <p className="text-xs text-gray-400">Button re-enabled in 30 seconds.</p>
          )}
        </form>
      )}
    </div>
  );
}
