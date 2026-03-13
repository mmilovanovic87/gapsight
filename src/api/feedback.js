import en from '../locales/en.json';
import { FEEDBACK_TIMEOUT_MS } from '../logic/constants';
const FORMSPREE_URL = 'https://formspree.io/f/mjgakgzn';

/**
 * Submits feedback via Formspree with a 10-second AbortController timeout.
 *
 * Returns: { success: boolean, message?: string, timedOut?: boolean }
 *
 * Per spec: must wait for server 200 before showing success (no optimistic updates).
 * On timeout: show error with direct contact email.
 */
export async function submitFeedback({ issue_type, reference, description, honeypot }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FEEDBACK_TIMEOUT_MS);

  try {
    const res = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issue_type,
        reference,
        description,
        _gotcha: honeypot, // Formspree native honeypot field
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return { success: true };
    }

    const data = await res.json().catch(() => null);
    return { success: false, message: data?.error || en.feedback.error_message };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return { success: false, message: en.feedback.timeout_message, timedOut: true };
    }

    return { success: false, message: en.feedback.error_message };
  }
}
