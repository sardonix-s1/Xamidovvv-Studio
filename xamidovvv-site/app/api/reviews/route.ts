import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Very small best-effort rate limit (per server instance). RLS in Supabase is the real protection.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 3;
}

function validUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (b.hp) return NextResponse.json({ ok: true }); // honeypot: pretend success

  const name = String(b.name ?? "").trim();
  const text = String(b.text ?? "").trim();
  const url = String(b.url ?? "").trim();
  const rating = Number(b.rating);

  if (name.length < 2 || name.length > 60) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  if (text.length < 20 || text.length > 600) return NextResponse.json({ error: "Write at least 20 characters." }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Choose a rating." }, { status: 400 });
  if (url && (url.length > 200 || !validUrl(url))) return NextResponse.json({ error: "Enter a valid link." }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "Reviews are not connected yet." }, { status: 503 });

  const { error } = await sb.from("reviews").insert({ name, text, url: url || null, rating, status: "pending" });
  if (error) return NextResponse.json({ error: "Could not save the review." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
