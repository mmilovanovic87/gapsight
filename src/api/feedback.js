import en from '../locales/en.json';

const TIMEOUT_MS = 10_000;

/**
 * Submits feedback with a 10-second AbortController timeout.
 *
 * Returns: { success: boolean, message?: string, timedOut?: boolean }
 *
 * Per spec: must wait for server 200 before showing success (no optimistic updates).
 * On timeout: show error with direct contact email.
 */
export async function submitFeedback({ issue_type, reference, description, honeypot }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue_type, reference, description, honeypot }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    if (res.ok && data.success) {
      return { success: true };
    }

    return { success: false, message: data.message || en.feedback.error_message };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return { success: false, message: en.feedback.timeout_message, timedOut: true };
    }

    return { success: false, message: en.feedback.error_message };
  }
}
