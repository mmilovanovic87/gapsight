import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { uuid } = req.query;
  const { pin } = req.body;

  if (!pin) {
    return res.status(400).json({ success: false, message: 'PIN is required' });
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
    console.error('PIN verify error:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify PIN' });
  }
}
