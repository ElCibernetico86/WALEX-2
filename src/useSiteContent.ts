/**
 * Gives components their content, and is the seam where saved edits arrive.
 *
 * It starts with `defaultContent` — the copy compiled into the build — so the
 * page renders complete on the very first paint. It then asks the server for
 * whatever Alex has saved and merges that on top.
 *
 * The order matters. Fetching first and rendering second would mean a blank or
 * half-built page every visit, and a total outage whenever the backend hiccups.
 * This way the backend is an enhancement: if it is slow, unreachable, or not
 * configured yet, visitors still get a correct page built from the last deploy.
 *
 * Until /api/content exists, the fetch simply 404s and is ignored — which is
 * why the site works right now with no backend at all.
 */

import { useEffect, useState } from "react";
import { defaultContent, type SiteContent } from "./siteContent";

/** Milliseconds to wait for saved content before giving up and staying on defaults. */
const FETCH_TIMEOUT_MS = 4000;

/**
 * Merge saved values over defaults, key by key.
 *
 * Deliberately NOT a blind `{...a, ...b}`: a saved object holding only
 * `hero.badge` must not wipe out the rest of `hero`. Arrays are replaced
 * wholesale rather than merged — for a list of services or gallery photos,
 * "what Alex saved" is the whole list, and index-merging two arrays of
 * different lengths produces nonsense.
 */
function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (Array.isArray(base) || Array.isArray(override)) return (override as T) ?? base;
  if (typeof base !== "object" || typeof override !== "object") return (override as T) ?? base;

  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    out[key] = key in (base as Record<string, unknown>)
      ? deepMerge((base as Record<string, unknown>)[key], value)
      : value;
  }
  return out as T;
}

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(defaultContent);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    fetch("/api/content", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((saved) => {
        if (saved && typeof saved === "object") {
          setContent((current) => deepMerge(current, saved));
        }
      })
      // No backend, offline, slow, malformed JSON — all the same answer here:
      // keep the defaults. A content fetch must never be able to break the page.
      .catch(() => {})
      .finally(() => clearTimeout(timer));

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  return content;
}

export { deepMerge };
