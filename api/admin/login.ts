import { checkPassword, issueSessionCookie } from '../_lib';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD is not set on this deployment' });
  }
  if (!checkPassword(req.body?.password)) {
    // Deliberately vague, and no hint about which part was wrong.
    return res.status(401).json({ error: 'Incorrect password' });
  }

  res.setHeader('Set-Cookie', issueSessionCookie());
  return res.status(200).json({ ok: true });
}
