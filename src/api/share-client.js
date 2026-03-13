/**
 * Client-side functions for the share link API.
 *
 * All functions call Vercel Edge Function endpoints under /api/share/.
 * Share links are stored in Vercel KV with a 12-month TTL.
 *
 * @module share-client
 */

/**
 * Creates a new share link for an assessment.
 *
 * @param {object} assessment - Full assessment data to share
 * @param {string|null} pin - Optional numeric PIN (4-8 digits) for protection
 * @returns {Promise<{ success: boolean, share_id?: string, has_pin?: boolean, expires_at?: string }>}
 */
export async function createShareLink(assessment, pin) {
  const res = await fetch('/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assessment, pin: pin || null }),
  });
  return res.json();
}

/**
 * Retrieves a shared assessment by UUID.
 *
 * @param {string} uuid - Share link UUID
 * @returns {Promise<{ success: boolean, requires_pin?: boolean, data?: object }>}
 */
export async function getSharedAssessment(uuid) {
  const res = await fetch(`/api/share/${uuid}`);
  return res.json();
}

/**
 * Verifies a PIN for a protected share link.
 *
 * @param {string} uuid - Share link UUID
 * @param {string} pin - Numeric PIN to verify
 * @returns {Promise<{ success: boolean, data?: object }>}
 */
export async function verifyPin(uuid, pin) {
  const res = await fetch(`/api/share/verify-pin/${uuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  return res.json();
}

/**
 * Extends the TTL of a share link by 12 months.
 *
 * @param {string} uuid - Share link UUID
 * @returns {Promise<{ success: boolean, expires_at?: string }>}
 */
export async function extendShareLink(uuid) {
  const res = await fetch(`/api/share/extend/${uuid}`, {
    method: 'POST',
  });
  return res.json();
}

/**
 * Deletes a share link permanently.
 *
 * @param {string} uuid - Share link UUID
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteShareLink(uuid) {
  const res = await fetch(`/api/share/${uuid}`, {
    method: 'DELETE',
  });
  return res.json();
}
