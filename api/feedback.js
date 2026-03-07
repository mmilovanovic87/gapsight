import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { issue_type, reference, description, honeypot } = req.body;

    // Honeypot check — bots fill hidden fields
    if (honeypot) {
      // Silently accept to not reveal the honeypot
      return res.status(200).json({ success: true });
    }

    // Validation
    const validTypes = ['wrong_mapping', 'outdated_requirement', 'unclear_description', 'technical_problem', 'other'];
    if (!issue_type || !validTypes.includes(issue_type)) {
      return res.status(400).json({ success: false, message: 'Invalid issue type' });
    }

    if (!description || description.length < 20) {
      return res.status(400).json({ success: false, message: 'Description must be at least 20 characters' });
    }

    // Rate limiting: 3 requests per IP per hour
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const rateLimitKey = `feedback_rate:${ip}`;
    const currentCount = (await kv.get(rateLimitKey)) || 0;

    if (currentCount >= 3) {
      return res.status(429).json({ success: false, message: 'Rate limit exceeded. Please try again later.' });
    }

    // Increment rate limit counter (expires in 1 hour)
    await kv.set(rateLimitKey, currentCount + 1, { ex: 3600 });

    // Store feedback
    const feedbackId = `feedback:${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const feedbackData = {
      issue_type,
      reference: reference || null,
      description,
      submitted_at: new Date().toISOString(),
      ip,
    };

    await kv.set(feedbackId, JSON.stringify(feedbackData), { ex: 31_536_000 });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Feedback error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
}
