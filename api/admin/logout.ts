import { clearSessionCookie } from '../_lib.js';

export default async function handler(_req: any, res: any) {
  res.setHeader('Set-Cookie', clearSessionCookie());
  return res.status(200).json({ ok: true });
}
