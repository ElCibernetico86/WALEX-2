/**
 * Store one image and hand back its public URL. Requires a valid session.
 *
 * The browser has already resized, compressed and re-encoded the file before it
 * gets here (see Admin.tsx). That is deliberate and not just an optimisation:
 *
 *   - a 4MB phone photo never crosses the network, which matters on site data
 *   - re-encoding through a canvas drops EXIF, and these are photos of
 *     customers' houses — their GPS coordinates should not ship to the web
 *   - no image library in the serverless function, so nothing to keep patched
 *
 * The size cap below is therefore a backstop against a malformed or hostile
 * request, not the primary defence.
 */
import { supabase, IMAGE_BUCKET, rejectIfUnauthed } from '../_lib';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const config = { api: { bodyParser: { sizeLimit: '3mb' } } };

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (rejectIfUnauthed(req, res)) return;

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase is not configured on this deployment' });
  }

  const { dataUrl, name } = req.body || {};
  if (typeof dataUrl !== 'string') return res.status(400).json({ error: 'Expected dataUrl' });

  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return res.status(400).json({ error: 'Malformed image data' });

  const [, mime, b64] = match;
  if (!ALLOWED.has(mime)) return res.status(415).json({ error: `Unsupported type: ${mime}` });

  const bytes = Buffer.from(b64, 'base64');
  if (bytes.byteLength > MAX_BYTES) {
    return res.status(413).json({ error: 'Image too large after compression' });
  }

  // Timestamped name: uploading a replacement never silently overwrites the
  // photo a previous version of the page is still pointing at.
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  const safe = String(name || 'photo').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const path = `${Date.now()}-${safe}.${ext}`;

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: false });

  if (error) return res.status(500).json({ error: error.message });

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return res.status(200).json({ url: data.publicUrl, bytes: bytes.byteLength });
}
