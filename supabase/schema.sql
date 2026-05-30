-- Initial schema for Find New Clubs.
-- Run this in Supabase SQL editor after creating your project.

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('member', 'group')),
  created_at timestamptz not null default now()
);

create table if not exists public.member_criteria (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  preferred_type text not null default 'All',
  location text not null,
  radius_miles integer not null default 35,
  email_alerts boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  club_type text not null,
  location text not null,
  description text not null,
  contact_email text not null,
  status text not null default 'active' check (status in ('active', 'expired')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.interests (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  member_user_id uuid references public.profiles(id) on delete set null,
  person_name text not null,
  email text not null,
  phone text,
  notes text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references public.listings(id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  body text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.member_criteria enable row level security;
alter table public.organizations enable row level security;
alter table public.listings enable row level security;
alter table public.interests enable row level security;
alter table public.notifications enable row level security;

create policy "profiles are self readable" on public.profiles for select using (auth.uid() = id);
create policy "profiles are self writable" on public.profiles for insert with check (auth.uid() = id);
create policy "member criteria self access" on public.member_criteria for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "organizations owner access" on public.organizations for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "active listings are public" on public.listings for select using (status = 'active');
create policy "organization owners manage listings" on public.listings for all using (organization_id in (select id from public.organizations where owner_user_id = auth.uid())) with check (organization_id in (select id from public.organizations where owner_user_id = auth.uid()));
create policy "members can create interests" on public.interests for insert with check (true);
create policy "owners can read interests" on public.interests for select using (listing_id in (select l.id from public.listings l join public.organizations o on o.id = l.organization_id where o.owner_user_id = auth.uid()));
create policy "owners can read notifications" on public.notifications for select using (listing_id in (select l.id from public.listings l join public.organizations o on o.id = l.organization_id where o.owner_user_id = auth.uid()));
