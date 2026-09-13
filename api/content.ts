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
  /* Short cache on purpose. The first version used s-maxage=60 with a
     10-minute stale window, which meant saving an edit and refreshing could
     still show the old text — it looks broken even though nothing is.
     10s keeps a traffic burst off the database while making a save feel
     immediate. No stale-while-revalidate: serving content known to be old is
     exactly the behaviour that caused the confusion. */
  res.setHeader('Cache-Control', 'public, s-maxage=10, must-revalidate');

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
