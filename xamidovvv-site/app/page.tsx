import Script from "next/script";
import { MARKUP } from "@/components/markup";
import { getSupabase } from "@/lib/supabase";

export const revalidate = 60; // refresh contacts and approved reviews at most once a minute

async function load() {
  const empty = { contacts: { telegram: "", channel: "", instagram: "", tiktok: "", phone: "" }, reviews: [] as unknown[] };
  const sb = getSupabase();
  if (!sb) return empty;
  try {
    const [s, r] = await Promise.all([
      sb.from("site_settings").select("telegram,channel,instagram,tiktok,phone").eq("id", 1).maybeSingle(),
      sb.from("reviews").select("name,url,rating,text").eq("status", "approved").order("created_at", { ascending: false }).limit(30),
    ]);
    return { contacts: { ...empty.contacts, ...(s.data ?? {}) }, reviews: r.data ?? [] };
  } catch {
    return empty;
  }
}

export default async function Home() {
  const cfg = await load();
  const json = JSON.stringify(cfg).replace(/</g, "\\u003c");
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: MARKUP }} />
      <script dangerouslySetInnerHTML={{ __html: `window.__XAMIDOVVV=${json};` }} />
      <Script src="/site.js" strategy="afterInteractive" />
    </>
  );
}
