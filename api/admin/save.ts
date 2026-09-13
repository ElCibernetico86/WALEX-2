/**
 * Save the edited content. Requires a valid session.
 *
 * Stores the WHOLE content object as one JSON row rather than a table of
 * fields. The shape changes whenever the site does, and a rigid schema would
 * mean a migration every time a headline moves — for one row of text, that
 * trade is not worth making.
 */
import { supabase, CONTENT_TABLE, CONTENT_ROW_ID, rejectIfUnauthed } from '../_lib.js';

/** Refuse anything implausibly large — this is text, not a file upload. */
const MAX_BYTES = 512 * 1024;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (rejectIfUnauthed(req, res)) return;

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase is not configured on this deployment' });
  }

  const content = req.body?.content;
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return res.status(400).json({ error: 'Expected a content object' });
  }
  if (Buffer.byteLength(JSON.stringify(content)) > MAX_BYTES) {
    return res.status(413).json({ error: 'Content is too large' });
  }

  const { error } = await supabase
    .from(CONTENT_TABLE)
    .upsert({ id: CONTENT_ROW_ID, content, updated_at: new Date().toISOString() });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true, savedAt: new Date().toISOString() });
}
