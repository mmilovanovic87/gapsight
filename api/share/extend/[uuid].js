import { kv } from '@vercel/kv';

const TTL_SECONDS = 31_536_000; // 12 months

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { uuid } = req.query;
  const key = `assessment:${uuid}`;

  try {
    const raw = await kv.get(key);
    if (!raw) {
      return res.status(404).json({ success: false, message: 'Assessment not found or expired' });
    }

    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const newExpiry = new Date(Date.now() + TTL_SECONDS * 1000).toISOString();
    data.expires_at = newExpiry;

    await kv.set(key, JSON.stringify(data), { ex: TTL_SECONDS });

    return res.status(200).json({ success: true, expires_at: newExpiry });
  } catch (err) {
    // Error logged server-side only via Vercel runtime
    return res.status(500).json({ success: false, message: 'Failed to extend share link' });
  }
}
