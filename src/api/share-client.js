/**
 * Client-side functions for the share link API.
 */

export async function createShareLink(assessment, pin) {
  const res = await fetch('/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assessment, pin: pin || null }),
  });
  return res.json();
}

export async function getSharedAssessment(uuid) {
  const res = await fetch(`/api/share/${uuid}`);
  return res.json();
}

export async function verifyPin(uuid, pin) {
  const res = await fetch(`/api/share/verify-pin/${uuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  return res.json();
}

export async function extendShareLink(uuid) {
  const res = await fetch(`/api/share/extend/${uuid}`, {
    method: 'POST',
  });
  return res.json();
}

export async function deleteShareLink(uuid) {
  const res = await fetch(`/api/share/${uuid}`, {
    method: 'DELETE',
  });
  return res.json();
}
