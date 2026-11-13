-- Run this in Supabase: SQL Editor -> New query -> paste -> Run.

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 60),
  url         text check (url is null or char_length(url) <= 200),
  rating      int  not null check (rating between 1 and 5),
  text        text not null check (char_length(text) between 20 and 600),
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now()
);
create index if not exists reviews_status_created_idx on public.reviews (status, created_at desc);

create table if not exists public.site_settings (
  id         int primary key default 1 check (id = 1),
  telegram   text default '',
  channel    text default '',
  instagram  text default '',
  tiktok     text default '',
  phone      text default ''
);
insert into public.site_settings (id) values (1) on conflict do nothing;

alter table public.reviews enable row level security;
alter table public.site_settings enable row level security;

-- Visitors: may read approved reviews and add a new PENDING review, nothing else.
create policy "public read approved" on public.reviews for select to anon using (status = 'approved');
create policy "public insert pending" on public.reviews for insert to anon with check (status = 'pending');
-- Visitors may read contacts.
create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);

-- Admin (a logged-in user; keep public sign-ups DISABLED in Supabase Auth settings): full access.
create policy "admin all reviews" on public.reviews for all to authenticated using (true) with check (true);
create policy "admin update settings" on public.site_settings for update to authenticated using (true) with check (true);
