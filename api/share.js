import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';

const TTL_SECONDS = 31_536_000; // 12 months

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { assessment, pin } = req.body;

    if (!assessment || !assessment.assessment_id) {
      return res.status(400).json({ success: false, message: 'Missing assessment data' });
    }

    const pinHash = pin ? await bcrypt.hash(pin, 10) : null;
    const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000).toISOString();

    const shareData = {
      assessment_id: assessment.assessment_id,
      generated_at: assessment.generated_at || new Date().toISOString(),
      kb_version: assessment.kb_version,
      tos_accepted_at: assessment.tos_accepted_at,
      disclaimer_confirmed_at: assessment.disclaimer_confirmed_at,
      profile: assessment.profile,
      inputs: assessment.inputs,
      results: assessment.results,
      cross_metric_warnings: assessment.cross_metric_warnings,
      action_items: assessment.action_items,
      risk_level: assessment.risk_level,
      risk_level_criteria: assessment.risk_level_criteria,
      pin_hash: pinHash,
      has_pin: !!pin,
      expires_at: expiresAt,
      disclaimer: 'Informative self-assessment only. Not legal advice. Not a certificate of regulatory compliance.',
    };

    const key = `assessment:${assessment.assessment_id}`;
    await kv.set(key, JSON.stringify(shareData), { ex: TTL_SECONDS });

    return res.status(200).json({
      success: true,
      share_id: assessment.assessment_id,
      has_pin: !!pin,
      expires_at: expiresAt,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create share link' });
  }
}
