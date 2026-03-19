import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { uuid } = req.query;
  const key = `assessment:${uuid}`;

  if (req.method === 'GET') {
    try {
      const raw = await kv.get(key);
      if (!raw) {
        return res.status(404).json({ success: false, message: 'Assessment not found or expired' });
      }

      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

      if (data.has_pin) {
        // Don't return full data if PIN protected — require PIN verification first
        return res.status(200).json({
          success: true,
          requires_pin: true,
          assessment_id: data.assessment_id,
          kb_version: data.kb_version,
          expires_at: data.expires_at,
        });
      }

      // No PIN — return full data (minus pin_hash)
      const { pin_hash, ...safeData } = data;
      return res.status(200).json({ success: true, requires_pin: false, data: safeData });
    } catch (err) {
      // Error logged server-side only via Vercel runtime
      return res.status(500).json({ success: false, message: 'Failed to retrieve assessment' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await kv.del(key);
      return res.status(200).json({ success: true });
    } catch (err) {
      // Error logged server-side only via Vercel runtime
      return res.status(500).json({ success: false, message: 'Failed to delete share link' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
