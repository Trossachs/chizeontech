-- Chizeon site: content, admin access, contact submissions, media.
-- Run once in the Supabase SQL editor (or via supabase db push).

-- 1. Admins: only emails listed here can edit content.
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

alter table public.admin_users enable row level security;
create policy "admins read admin list" on public.admin_users
  for select to authenticated using (public.is_admin());
create policy "admins manage admin list" on public.admin_users
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 2. Site content: one row (id = 'site'). `draft` is what admins edit; `live` is what the public site builds from.
create table if not exists public.site_content (
  id text primary key,
  draft jsonb not null default '{}'::jsonb,
  live jsonb,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.site_content enable row level security;
create policy "public read content" on public.site_content
  for select to anon, authenticated using (true);
create policy "admins write content" on public.site_content
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 3. Contact submissions: anyone can send, only admins can read.
create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200),
  company text check (company is null or char_length(company) <= 160),
  topic text not null check (char_length(topic) <= 120),
  message text not null check (char_length(message) between 10 and 4000),
  created_at timestamptz not null default now(),
  handled boolean not null default false
);

alter table public.form_submissions enable row level security;
create policy "anyone can submit" on public.form_submissions
  for insert to anon, authenticated with check (true);
create policy "admins read submissions" on public.form_submissions
  for select to authenticated using (public.is_admin());
create policy "admins update submissions" on public.form_submissions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- 4. Media bucket for slideshow and venture images.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');
create policy "admins upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "admins update media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "admins delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- 5. Audit trail of publishes.
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor text,
  action text not null,
  created_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;
create policy "admins read audit" on public.audit_log
  for select to authenticated using (public.is_admin());
create policy "admins write audit" on public.audit_log
  for insert to authenticated with check (public.is_admin());
