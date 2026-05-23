-- Per-user reviews on venues; keeps venues.rating and venues.review_count in sync.

create table if not exists public.venue_reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, user_id)
);

create index if not exists venue_reviews_venue_id_idx on public.venue_reviews (venue_id);
create index if not exists venue_reviews_user_id_idx on public.venue_reviews (user_id);

comment on table public.venue_reviews is 'Customer reviews; one row per user per venue.';

alter table public.venue_reviews enable row level security;

create policy "venue_reviews_select_public"
  on public.venue_reviews for select
  to anon, authenticated
  using (true);

create policy "venue_reviews_insert_own"
  on public.venue_reviews for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "venue_reviews_update_own"
  on public.venue_reviews for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.refresh_venue_review_aggregates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  vid uuid;
  avg_r numeric;
  cnt int;
begin
  vid := coalesce(new.venue_id, old.venue_id);

  select
    case when count(*) = 0 then null else round(avg(rating)::numeric, 2) end,
    count(*)::int
  into avg_r, cnt
  from public.venue_reviews
  where venue_id = vid;

  update public.venues
  set rating = avg_r, review_count = cnt
  where id = vid;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_venue_reviews_refresh on public.venue_reviews;

create trigger trg_venue_reviews_refresh
  after insert or update or delete on public.venue_reviews
  for each row execute procedure public.refresh_venue_review_aggregates();
