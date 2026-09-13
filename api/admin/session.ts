import { isAuthed } from '../_lib';

/** Lets the admin page know on load whether to show the form or the password box. */
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    authed: isAuthed(req.headers?.cookie || ''),
    configured: Boolean(process.env.SUPABASE_URL && process.env.ADMIN_PASSWORD),
  });
}
