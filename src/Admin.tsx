/**
 * The admin page. Reachable at /admin.
 *
 * The form is generated from the shape of siteContent rather than hand-written
 * field by field. Add a headline to siteContent.ts and an input for it appears
 * here automatically — with ~60 editable values and more coming, hand-writing
 * the form would guarantee they drift apart.
 *
 * Images are resized IN THE BROWSER before upload. Three reasons, in order of
 * importance: re-encoding through a canvas strips EXIF, and phone photos of
 * customers' houses carry their GPS coordinates; a 4MB original never crosses
 * the network, which matters standing in a driveway on cell data; and the
 * serverless function needs no image library.
 */

import { useEffect, useMemo, useState } from "react";
import { defaultContent, type SiteContent } from "./siteContent";
import { deepMerge } from "./useSiteContent";

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.78;

/** "backgroundImage" -> "Background image" */
const labelFor = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();

const isImageKey = (key: string) => /image|photo|logo/i.test(key);

/**
 * A blank entry shaped like the ones already in the list — so "Add" on the
 * services list produces a service with the right fields, not an empty string.
 * Falls back to "" for an empty list, where there is no shape to copy.
 */
function blankLike(sample: unknown): unknown {
  if (typeof sample === "string") return "";
  if (Array.isArray(sample)) return [];
  if (sample && typeof sample === "object") {
    return Object.fromEntries(Object.entries(sample).map(([k, v]) => [k, blankLike(v)]));
  }
  return "";
}

/** Draw through a canvas to shrink, compress, and drop metadata in one step. */
async function shrink(file: File): Promise<{ dataUrl: string; kb: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  return { dataUrl, kb: Math.round((dataUrl.length * 0.75) / 1024) };
}

function ImageField({
  value, onChange, onBusy,
}: { value: string; onChange: (v: string) => void; onBusy: (b: boolean) => void }) {
  const [status, setStatus] = useState<string | null>(null);

  async function pick(file?: File | null) {
    if (!file) return;
    setStatus("Preparing…");
    onBusy(true);
    try {
      const { dataUrl, kb } = await shrink(file);
      setStatus(`Uploading ${kb}KB…`);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, name: file.name.replace(/\.[^.]+$/, "") }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      onChange(json.url);
      setStatus(`Done — ${Math.round(json.bytes / 1024)}KB`);
    } catch (err: any) {
      setStatus(err.message || "Upload failed");
    } finally {
      onBusy(false);
    }
  }

  return (
    <div style={S.imageRow}>
      {value ? <img src={value} alt="" style={S.thumb} /> : <div style={S.thumbEmpty}>none</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => pick(e.target.files?.[0])}
          style={S.file}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="or paste an image URL"
          style={{ ...S.input, fontSize: 12, marginTop: 6 }}
        />
        {status && <div style={S.status}>{status}</div>}
      </div>
    </div>
  );
}

/** Recursively turn a slice of the content object into form fields. */
function Fields({
  value, path, onChange, onBusy,
}: {
  value: any;
  path: string[];
  onChange: (path: string[], v: any) => void;
  onBusy: (b: boolean) => void;
}) {
  const key = path[path.length - 1] ?? "";
  /* Inside a list the key is just the index ("3"), so fall back to the list's
     own name. Without this, adding a gallery photo hands you a text box
     instead of an upload button — the array is called "images", the new item
     is called "3". */
  const parentKey = path[path.length - 2] ?? "";

  if (typeof value === "string") {
    const looksLikeImage =
      isImageKey(key) ||
      (/^\d+$/.test(key) && isImageKey(parentKey)) ||
      value.startsWith("/") ||
      /\.(jpe?g|png|webp)(\?|$)/i.test(value);

    if (looksLikeImage) {
      return <ImageField value={value} onChange={(v) => onChange(path, v)} onBusy={onBusy} />;
    }
    const long = value.length > 70;
    return long ? (
      <textarea value={value} rows={3} onChange={(e) => onChange(path, e.target.value)} style={S.input} />
    ) : (
      <input value={value} onChange={(e) => onChange(path, e.target.value)} style={S.input} />
    );
  }

  if (Array.isArray(value)) {
    /* Add, remove and reorder all rewrite the whole array at this path rather
       than editing one index — simpler to reason about, and it keeps the
       parent's deepMerge behaviour (arrays replace wholesale) consistent. */
    const replace = (next: unknown[]) => onChange(path, next);
    const move = (from: number, to: number) => {
      if (to < 0 || to >= value.length) return;
      const next = [...value];
      [next[from], next[to]] = [next[to], next[from]];
      replace(next);
    };

    return (
      <div style={S.list}>
        {value.map((item, i) => (
          <div key={i} style={S.listItem}>
            <div style={S.listControls}>
              <span style={S.listIndex}>{i + 1}</span>
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                title="Move up"
                style={i === 0 ? S.iconBtnOff : S.iconBtn}
              >↑</button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === value.length - 1}
                title="Move down"
                style={i === value.length - 1 ? S.iconBtnOff : S.iconBtn}
              >↓</button>
              <button
                type="button"
                onClick={() => replace(value.filter((_, n) => n !== i))}
                title="Remove"
                style={S.removeBtn}
              >✕</button>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Fields value={item} path={[...path, String(i)]} onChange={onChange} onBusy={onBusy} />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => replace([...value, blankLike(value[0])])}
          style={S.addBtn}
        >
          + Add {labelFor(key).replace(/s$/, "").toLowerCase() || "item"}
        </button>
      </div>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div style={S.group}>
        {Object.entries(value).map(([k, v]) => (
          <label key={k} style={S.field}>
            <span style={S.label}>{labelFor(k)}</span>
            <Fields value={v} path={[...path, k]} onChange={onChange} onBusy={onBusy} />
          </label>
        ))}
      </div>
    );
  }

  return null;
}

export default function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>("hero");

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((s) => { setAuthed(!!s.authed); setConfigured(s.configured !== false); })
      .catch(() => setAuthed(false));

    // Start from what's live, so edits build on the saved version rather than
    // silently reverting it to whatever shipped in the last deploy.
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : null))
      .then((saved) => saved && setContent((c) => deepMerge(c, saved)))
      .catch(() => {});
  }, []);

  const sections = useMemo(() => Object.keys(content), [content]);

  function update(path: string[], value: any) {
    setContent((prev) => {
      const next = structuredClone(prev) as any;
      let node = next;
      for (const k of path.slice(0, -1)) node = node[k];
      node[path[path.length - 1]] = value;
      return next;
    });
    setDirty(true);
    setSaved(null);
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) { setAuthed(true); setPassword(""); }
    else setError(json.error || "Could not sign in");
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Save failed");
      setDirty(false);
      setSaved(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (authed === null) return <div style={S.page}><p style={S.muted}>Loading…</p></div>;

  if (!authed) {
    return (
      <div style={S.page}>
        <form onSubmit={login} style={S.loginCard}>
          <h1 style={S.loginTitle}>WALEX admin</h1>
          {!configured && (
            <p style={S.warn}>
              This deployment is missing its environment variables. Check SUPABASE_URL,
              SUPABASE_SECRET_KEY and ADMIN_PASSWORD in Vercel, then redeploy.
            </p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={S.input}
          />
          {error && <p style={S.error}>{error}</p>}
          <button type="submit" style={S.primary}>Sign in</button>
        </form>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <header style={S.bar}>
        <div>
          <strong style={{ fontSize: 15 }}>WALEX admin</strong>
          <div style={S.muted}>
            {dirty ? "Unsaved changes" : saved ? `Saved at ${saved}` : "No changes"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="/" target="_blank" rel="noreferrer" style={S.ghost}>View site</a>
          <button onClick={save} disabled={!dirty || busy} style={dirty && !busy ? S.primary : S.disabled}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      {error && <p style={{ ...S.error, margin: "12px 0" }}>{error}</p>}

      <p style={S.help}>
        Changes go live as soon as you save — no redeploy. Photos are shrunk and stripped of
        location data in your browser before they upload.
      </p>

      {sections.map((name) => (
        <section key={name} style={S.section}>
          <button onClick={() => setOpen(open === name ? null : name)} style={S.sectionHead}>
            <span>{labelFor(name)}</span>
            <span style={S.muted}>{open === name ? "−" : "+"}</span>
          </button>
          {open === name && (
            <div style={S.sectionBody}>
              <Fields
                value={(content as any)[name]}
                path={[name]}
                onChange={update}
                onBusy={setBusy}
              />
            </div>
          )}
        </section>
      ))}

      <button
        onClick={() => fetch("/api/admin/logout", { method: "POST" }).then(() => setAuthed(false))}
        style={{ ...S.ghost, marginTop: 24 }}
      >
        Sign out
      </button>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { maxWidth: 720, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif", color: "#0f172a" },
  bar: {
    position: "sticky", top: 0, zIndex: 10, background: "#fff", display: "flex",
    justifyContent: "space-between", alignItems: "center", gap: 12,
    padding: "12px 0", borderBottom: "1px solid #e2e8f0", marginBottom: 12,
  },
  loginCard: { maxWidth: 340, margin: "15vh auto", display: "flex", flexDirection: "column", gap: 12 },
  loginTitle: { fontSize: 20, margin: 0 },
  section: { border: "1px solid #e2e8f0", borderRadius: 12, marginBottom: 10, overflow: "hidden" },
  sectionHead: {
    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 16px", background: "#f8fafc", border: 0, fontSize: 15, fontWeight: 600,
    cursor: "pointer", textAlign: "left",
  },
  sectionBody: { padding: 16, borderTop: "1px solid #e2e8f0" },
  group: { display: "flex", flexDirection: "column", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: "#64748b" },
  input: {
    width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8,
    fontSize: 15, fontFamily: "inherit", boxSizing: "border-box",
  },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  listItem: { display: "flex", gap: 10, alignItems: "flex-start", background: "#f8fafc", padding: 12, borderRadius: 10 },
  listIndex: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textAlign: "center" },
  listControls: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 4 },
  iconBtn: { width: 22, height: 22, padding: 0, border: "1px solid #cbd5e1", background: "#fff", borderRadius: 5, cursor: "pointer", fontSize: 11, lineHeight: 1, color: "#475569" },
  iconBtnOff: { width: 22, height: 22, padding: 0, border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: 5, cursor: "default", fontSize: 11, lineHeight: 1, color: "#cbd5e1" },
  removeBtn: { width: 22, height: 22, padding: 0, border: "1px solid #fecaca", background: "#fff", borderRadius: 5, cursor: "pointer", fontSize: 11, lineHeight: 1, color: "#dc2626" },
  addBtn: { alignSelf: "flex-start", padding: "8px 14px", border: "1px dashed #cbd5e1", background: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#475569", fontWeight: 600 },
  imageRow: { display: "flex", gap: 10, alignItems: "flex-start" },
  thumb: { width: 64, height: 64, objectFit: "cover", borderRadius: 8, background: "#e2e8f0", flexShrink: 0 },
  thumbEmpty: {
    width: 64, height: 64, borderRadius: 8, background: "#f1f5f9", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#94a3b8",
  },
  file: { fontSize: 13, width: "100%" },
  status: { fontSize: 12, color: "#64748b", marginTop: 4 },
  primary: { padding: "10px 18px", background: "#002366", color: "#fff", border: 0, borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" },
  disabled: { padding: "10px 18px", background: "#e2e8f0", color: "#94a3b8", border: 0, borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "default" },
  ghost: { padding: "10px 14px", background: "transparent", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, cursor: "pointer", textDecoration: "none" },
  muted: { fontSize: 12, color: "#94a3b8" },
  help: { fontSize: 13, color: "#64748b", margin: "0 0 16px", lineHeight: 1.5 },
  error: { color: "#b91c1c", fontSize: 13, margin: 0 },
  warn: { color: "#92400e", fontSize: 13, background: "#fffbeb", padding: 10, borderRadius: 8, margin: 0 },
};
