"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Review = { id: string; name: string; url: string | null; rating: number; text: string; status: string; created_at: string };
type Settings = { telegram: string; channel: string; instagram: string; tiktok: string; phone: string };

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "x");

const box: React.CSSProperties = { border: "1px solid rgba(255,255,255,.15)", borderRadius: 14, padding: 16, marginBottom: 12, background: "rgba(255,255,255,.04)" };
const inp: React.CSSProperties = { width: "100%", padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "#0b0b0d", color: "#fff", marginBottom: 10 };
const btn: React.CSSProperties = { padding: "8px 14px", borderRadius: 99, border: "1px solid rgba(255,255,255,.3)", background: "#fff", color: "#000", cursor: "pointer", marginRight: 8 };
const btn2: React.CSSProperties = { ...btn, background: "transparent", color: "#fff" };

export default function Admin() {
  const [session, setSession] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [s, setS] = useState<Settings>({ telegram: "", channel: "", instagram: "", tiktok: "", phone: "" });
  const [filter, setFilter] = useState("pending");

  const load = useCallback(async () => {
    const r = await sb.from("reviews").select("*").order("created_at", { ascending: false });
    setReviews((r.data as Review[]) ?? []);
    const st = await sb.from("site_settings").select("telegram,channel,instagram,tiktok,phone").eq("id", 1).maybeSingle();
    if (st.data) setS(st.data as Settings);
  }, []);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setSession(Boolean(data.session));
      if (data.session) load();
    });
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) return setMsg(error.message);
    setSession(true);
    setMsg("");
    load();
  }
  async function setStatus(id: string, status: string) {
    await sb.from("reviews").update({ status }).eq("id", id);
    load();
  }
  async function remove(id: string) {
    if (!window.confirm("Delete this review?")) return;
    await sb.from("reviews").delete().eq("id", id);
    load();
  }
  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await sb.from("site_settings").update(s).eq("id", 1);
    setMsg(error ? error.message : "Saved. The site updates within a minute.");
  }

  const wrap: React.CSSProperties = { maxWidth: 820, margin: "0 auto", padding: "40px 0", fontFamily: "system-ui, sans-serif" };
  if (session === null) return <div style={wrap}>Loading…</div>;
  if (!session)
    return (
      <form onSubmit={login} style={{ ...wrap, maxWidth: 380 }}>
        <h1 style={{ fontWeight: 300 }}>Admin</h1>
        <input style={inp} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <input style={inp} type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
        <button style={btn} type="submit">Sign in</button>
        <p style={{ color: "#f19a93" }}>{msg}</p>
      </form>
    );

  const shown = reviews.filter((r) => filter === "all" || r.status === filter);
  return (
    <div style={wrap}>
      <h1 style={{ fontWeight: 300 }}>Admin</h1>
      <button style={btn2} onClick={() => sb.auth.signOut().then(() => setSession(false))}>Sign out</button>

      <h2 style={{ fontWeight: 300, marginTop: 30 }}>Contacts</h2>
      <form onSubmit={saveSettings} style={box}>
        {(["telegram", "channel", "instagram", "tiktok", "phone"] as const).map((k) => (
          <input key={k} style={inp} placeholder={k === "phone" ? "Phone (optional)" : `${k} link (https://…)`} value={s[k] ?? ""} onChange={(e) => setS({ ...s, [k]: e.target.value })} />
        ))}
        <button style={btn} type="submit">Save</button>
        <span style={{ color: "#9b9da2" }}>{msg}</span>
      </form>

      <h2 style={{ fontWeight: 300, marginTop: 30 }}>Reviews</h2>
      <div style={{ marginBottom: 12 }}>
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button key={f} style={f === filter ? btn : btn2} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      {shown.length === 0 && <p style={{ color: "#9b9da2" }}>Nothing here.</p>}
      {shown.map((r) => (
        <div key={r.id} style={box}>
          <div>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} · <b>{r.name}</b> · <small>{r.status}</small></div>
          <p>{r.text}</p>
          {r.url && <p><a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "#9b9da2" }}>{r.url}</a></p>}
          <button style={btn} onClick={() => setStatus(r.id, "approved")}>Approve</button>
          <button style={btn2} onClick={() => setStatus(r.id, "rejected")}>Reject</button>
          <button style={btn2} onClick={() => remove(r.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
