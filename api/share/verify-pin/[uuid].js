import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { uuid } = req.query;

  if (!uuid || !UUID_RE.test(uuid)) {
    return res.status(400).json({ success: false, message: 'Invalid share link ID' });
  }

  const { pin } = req.body;

  if (!pin || typeof pin !== 'string' || !/^\d{4,8}$/.test(pin)) {
    return res.status(400).json({ success: false, message: 'PIN must be 4-8 digits' });
  }

  try {
    const key = `assessment:${uuid}`;
    const raw = await kv.get(key);

    if (!raw) {
      return res.status(404).json({ success: false, message: 'Assessment not found or expired' });
    }

    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (!data.pin_hash) {
      // No PIN set — return data directly
      const { pin_hash, ...safeData } = data;
      return res.status(200).json({ success: true, data: safeData });
    }

    const match = await bcrypt.compare(pin, data.pin_hash);
    if (!match) {
      return res.status(403).json({ success: false, message: 'Incorrect PIN' });
    }

    const { pin_hash, ...safeData } = data;
    return res.status(200).json({ success: true, data: safeData });
  } catch (err) {
    // Error logged server-side only via Vercel runtime
    return res.status(500).json({ success: false, message: 'Failed to verify PIN' });
  }
}
