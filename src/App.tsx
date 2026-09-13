/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from "react";
import LandingPage from "./components/LandingPage";

/* Lazy so the admin never ships to customers — it is a separate chunk that
   only downloads if someone actually opens /admin. */
const Admin = lazy(() => import("./Admin"));

export default function App() {
  /* One page and one admin route: a router library would be more moving parts
     than the problem has. vercel.json rewrites /admin to index.html so this
     check runs on a hard refresh, not just client-side navigation. */
  const isAdmin = typeof window !== "undefined" && window.location.pathname.replace(/\/$/, "") === "/admin";

  if (isAdmin) {
    return (
      <Suspense fallback={<div style={{ padding: 24, fontFamily: "system-ui" }}>Loading…</div>}>
        <Admin />
      </Suspense>
    );
  }
  return <LandingPage />;
}
