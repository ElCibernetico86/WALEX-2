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

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import {
  SECTION_TYPES,
  defaultContent,
  isSectionContentKey,
  type SectionRef,
  type SectionType,
  type SiteContent,
} from "./siteContent";
import { deepMerge } from "./useSiteContent";

/** Not a content key — the id the collapsible "Page sections" panel opens under. */
const SECTIONS_PANEL = "__sections";

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.78;

/** "backgroundImage" -> "Background image" */
const labelFor = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();

const isImageKey = (key: string) => /image|photo|logo/i.test(key);

/**
 * "Gallery", or "Gallery 2" for a second copy of the same layout.
 *
 * A duplicated section's id is `<type>-<n>`, so the number is recoverable from
 * the id and nothing extra has to be stored to label it.
 */
function sectionLabel(s: SectionRef): string {
  const base = SECTION_TYPES[s.type] ?? labelFor(s.type);
  return s.id.startsWith(`${s.type}-`) ? `${base} ${s.id.slice(s.type.length + 1)}` : base;
}

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

/** One collapsible group of fields. */
function Group({
  label, note, open, onToggle, children,
}: {
  label: string;
  note?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section style={S.section}>
      <button onClick={onToggle} style={S.sectionHead}>
        <span>{label}{note && <span style={S.chip}>{note}</span>}</span>
        <span style={S.muted}>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={S.sectionBody}>{children}</div>}
    </section>
  );
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
  const [open, setOpen] = useState<string | null>(SECTIONS_PANEL);
  const [addType, setAddType] = useState<SectionType>("services");

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

  /** The page's running order. */
  const sectionList: SectionRef[] = Array.isArray(content.sections) ? content.sections : [];

  /**
   * Content groups that are not sections — business, nav, hero, footer.
   *
   * `sections` itself is edited through the panel rather than as a generated
   * form: a raw list of {id, type, enabled} is exactly the kind of thing you
   * can break by typing in it.
   */
  const generalKeys = useMemo(
    () => Object.keys(content).filter((k) => k !== "sections" && !isSectionContentKey(k)),
    [content],
  );

  /* Menu links that point at no visible section. The site hides these so they
     can't lead nowhere; saying so here is what keeps that from being a
     mystery. */
  const danglingLinks = useMemo(() => {
    const anchors = new Set(
      sectionList.filter((s) => s.enabled !== false).map((s) => s.id.toLowerCase()),
    );
    return (content.nav?.links ?? []).filter((l) => !anchors.has(String(l).toLowerCase()));
  }, [content.nav, content.sections]);

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

  const setSections = (next: SectionRef[]) => update(["sections"], next);

  const toggleSection = (id: string) =>
    setSections(sectionList.map((s) => (s.id === id ? { ...s, enabled: s.enabled === false } : s)));

  /* Drops the section from the page but deliberately leaves its content behind,
     so adding it back returns the words Alex wrote rather than the factory
     copy. The leftover is a few hundred bytes in a row that's capped at 512KB. */
  const removeSection = (id: string) => setSections(sectionList.filter((s) => s.id !== id));

  function moveSection(from: number, to: number) {
    if (to < 0 || to >= sectionList.length) return;
    const next = [...sectionList];
    [next[from], next[to]] = [next[to], next[from]];
    setSections(next);
  }

  function addSection(type: SectionType) {
    const taken = new Set(sectionList.map((s) => s.id));
    let id = type as string;
    for (let n = 2; taken.has(id); n++) id = `${type}-${n}`;

    setContent((prev) => {
      const next = structuredClone(prev) as any;
      // Re-adding a removed section finds its content still there. A genuinely
      // new one starts from the copy that ships with the site.
      if (!next[id]) next[id] = structuredClone((defaultContent as any)[type]);
      next.sections = [...(Array.isArray(next.sections) ? next.sections : []), { id, type, enabled: true }];
      return next;
    });
    setDirty(true);
    setSaved(null);
    setOpen(id);   // jump straight to editing what was just added
  }

  async function login(e: FormEvent) {
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

      {/* The shape of the page, before any of its words. */}
      <section style={S.section}>
        <button
          onClick={() => setOpen(open === SECTIONS_PANEL ? null : SECTIONS_PANEL)}
          style={S.sectionHead}
        >
          <span>Page sections</span>
          <span style={S.muted}>{open === SECTIONS_PANEL ? "−" : "+"}</span>
        </button>
        {open === SECTIONS_PANEL && (
          <div style={S.sectionBody}>
            <p style={{ ...S.help, margin: "0 0 14px" }}>
              This is the order sections appear on the site. <strong>Hide</strong> takes one off
              the page but keeps its words; <strong>Remove</strong> takes it off this list, and
              adding it back later brings your words with it. The menu bar, the top banner and
              the footer are always on.
            </p>

            <div style={S.list}>
              {sectionList.map((s, i) => {
                const hidden = s.enabled === false;
                return (
                  <div key={s.id} style={S.rowItem}>
                    <div style={S.listControls}>
                      <button
                        type="button"
                        onClick={() => moveSection(i, i - 1)}
                        disabled={i === 0}
                        title="Move up"
                        style={i === 0 ? S.iconBtnOff : S.iconBtn}
                      >↑</button>
                      <button
                        type="button"
                        onClick={() => moveSection(i, i + 1)}
                        disabled={i === sectionList.length - 1}
                        title="Move down"
                        style={i === sectionList.length - 1 ? S.iconBtnOff : S.iconBtn}
                      >↓</button>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: hidden ? "#94a3b8" : "#0f172a" }}>
                        {sectionLabel(s)}
                        {hidden && <span style={S.chip}>Hidden</span>}
                      </div>
                      <div style={S.muted}>#{s.id}</div>
                    </div>

                    <button type="button" onClick={() => toggleSection(s.id)} style={S.smallBtn}>
                      {hidden ? "Show" : "Hide"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(s.id)}
                      title="Remove from the page"
                      style={S.removeBtn}
                    >✕</button>
                  </div>
                );
              })}
              {!sectionList.length && (
                <p style={S.muted}>
                  No sections — the site is just its banner and footer. Add one below.
                </p>
              )}
            </div>

            <div style={S.addRow}>
              <select
                value={addType}
                onChange={(e) => setAddType(e.target.value as SectionType)}
                style={{ ...S.input, flex: 1, minWidth: 150 }}
              >
                {Object.entries(SECTION_TYPES).map(([type, label]) => (
                  <option key={type} value={type}>{label}</option>
                ))}
              </select>
              <button type="button" onClick={() => addSection(addType)} style={S.addBtn}>
                + Add section
              </button>
            </div>

            {danglingLinks.length > 0 && (
              <p style={{ ...S.warn, marginTop: 12 }}>
                {danglingLinks.length === 1 ? "Menu link" : "Menu links"} pointing at nothing:{" "}
                <strong>{danglingLinks.join(", ")}</strong>. The site hides{" "}
                {danglingLinks.length === 1 ? "it" : "them"} rather than leave a link that goes
                nowhere — show the matching section again, or edit the menu under Nav.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Always-present content, then one group per section in page order. */}
      {generalKeys.map((name) => (
        <Group
          key={name}
          label={labelFor(name)}
          open={open === name}
          onToggle={() => setOpen(open === name ? null : name)}
        >
          <Fields value={(content as any)[name]} path={[name]} onChange={update} onBusy={setBusy} />
        </Group>
      ))}

      {sectionList.map((s) => (
        <Group
          key={s.id}
          label={sectionLabel(s)}
          note={s.enabled === false ? "Hidden" : undefined}
          open={open === s.id}
          onToggle={() => setOpen(open === s.id ? null : s.id)}
        >
          <Fields value={(content as any)[s.id]} path={[s.id]} onChange={update} onBusy={setBusy} />
        </Group>
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

const S: Record<string, CSSProperties> = {
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
  rowItem: { display: "flex", gap: 10, alignItems: "center", background: "#f8fafc", padding: 12, borderRadius: 10 },
  addRow: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" },
  smallBtn: { padding: "6px 12px", border: "1px solid #cbd5e1", background: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#475569", fontWeight: 600, flexShrink: 0 },
  chip: { marginLeft: 8, padding: "2px 7px", borderRadius: 999, background: "#e2e8f0", color: "#64748b", fontSize: 11, fontWeight: 700, verticalAlign: "middle" },
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
