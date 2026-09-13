/**
 * Shared bits for the admin API: the Supabase client and the login session.
 *
 * The session approach is lifted from service-apps/Junk Ninjas, which has been
 * running it in production. A password plus an HMAC-signed cookie is the right
 * weight for a single-owner admin — no user table, no OAuth, nothing to leak.
 */

import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase ────────────────────────────────────────────────────────────
const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

/**
 * Null when the env vars are missing, so the site degrades instead of crashing.
 * Callers must handle null — an unconfigured deploy should still serve the
 * landing page from its compiled-in defaults.
 */
export const supabase = url && secret
  ? createClient(url, secret, { auth: { persistSession: false } })
  : null;

export const CONTENT_TABLE = 'site_content';
export const CONTENT_ROW_ID = 'live';
export const IMAGE_BUCKET = 'site-images';

// ─── Session ─────────────────────────────────────────────────────────────
const adminPassword = process.env.ADMIN_PASSWORD;
const sessionSecret = process.env.ADMIN_SESSION_SECRET || adminPassword || 'dev-only-secret';
const COOKIE = 'walex_admin';
const MAX_AGE_SECONDS = 60 * 60 * 12;   // 12 hours

const sign = (value: string) => createHmac('sha256', sessionSecret).update(value).digest('hex');

/** Constant-time compare — a plain === leaks the answer through timing. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function checkPassword(candidate: unknown): boolean {
  if (!adminPassword || typeof candidate !== 'string') return false;
  // Hash both sides first so the compare is always over equal-length strings —
  // otherwise the length check above leaks the password's length.
  return safeEqual(sign(candidate), sign(adminPassword));
}

export function issueSessionCookie(): string {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const nonce = randomBytes(8).toString('hex');
  const payload = `${expires}.${nonce}`;
  const token = `${payload}.${sign(payload)}`;
  return [
    `${COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',                  // JavaScript can't read it, so XSS can't steal it
    'Secure',
    'SameSite=Strict',           // not sent on cross-site requests, which blocks CSRF
    `Max-Age=${MAX_AGE_SECONDS}`,
  ].join('; ');
}

export const clearSessionCookie = () =>
  `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export function isAuthed(cookieHeader = ''): boolean {
  const raw = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    }),
  )[COOKIE];

  if (!raw) return false;
  const [expires, nonce, mac] = raw.split('.');
  if (!expires || !nonce || !mac) return false;
  if (!safeEqual(sign(`${expires}.${nonce}`), mac)) return false;
  return Number(expires) > Date.now();
}

/** 401 unless the request carries a valid session. Returns true if handled. */
export function rejectIfUnauthed(req: any, res: any): boolean {
  if (isAuthed(req.headers?.cookie || '')) return false;
  res.status(401).json({ error: 'Not signed in' });
  return true;
}
