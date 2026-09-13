/**
 * Public: the saved content, or nothing.
 *
 * "Nothing" is a normal answer, not an error. If Supabase isn't configured, the
 * row doesn't exist yet, or the query fails, this returns {} and the site keeps
 * its compiled-in defaults. A content endpoint must never be able to break the
 * page it serves.
 */
import { supabase, CONTENT_TABLE, CONTENT_ROW_ID } from './_lib.js';

export default async function handler(_req: any, res: any) {
  // 60s CDN cache: edits appear within a minute, and a burst of visitors
  // doesn't turn into a burst of database reads.
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');

  if (!supabase) return res.status(200).json({});

  try {
    const { data, error } = await supabase
      .from(CONTENT_TABLE)
      .select('content')
      .eq('id', CONTENT_ROW_ID)
      .maybeSingle();

    if (error || !data) return res.status(200).json({});
    return res.status(200).json(data.content ?? {});
  } catch {
    return res.status(200).json({});
  }
}
