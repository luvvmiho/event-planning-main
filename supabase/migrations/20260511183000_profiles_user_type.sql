-- Persist user role and display fields for authenticated users (auth metadata mirror + queryable table).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  user_type text not null default 'user' check (user_type in ('user', 'provider')),
  full_name text,
  phone text,
  service_category text,
  registration_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile row per auth user; user_type synced at signup from auth metadata.';

create index profiles_user_type_idx on public.profiles (user_type);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own" on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Rows are created by handle_new_user; no insert policy on purpose.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text;
begin
  v_type := coalesce(trim(new.raw_user_meta_data ->> 'user_type'), '');
  if v_type not in ('user', 'provider') then
    v_type := 'user';
  end if;

  insert into public.profiles (id, user_type, full_name, phone, service_category, registration_number)
  values (
    new.id,
    v_type,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'service_category',
    new.raw_user_meta_data ->> 'registration_number'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill for users created before this migration (requires migration runner with access to auth.users).

insert into public.profiles (id, user_type, full_name, phone, service_category, registration_number)
select
  au.id,
  case
    when trim(coalesce(au.raw_user_meta_data ->> 'user_type', '')) in ('user', 'provider')
      then trim(au.raw_user_meta_data ->> 'user_type')
    else 'user'
  end,
  au.raw_user_meta_data ->> 'name',
  au.raw_user_meta_data ->> 'phone',
  au.raw_user_meta_data ->> 'service_category',
  au.raw_user_meta_data ->> 'registration_number'
from auth.users au
where not exists (select 1 from public.profiles p where p.id = au.id);
