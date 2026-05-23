-- Normalized venue categories: replaces venues.category (venue_category enum).

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.categories is 'Venue service types; venues.category_id references this table.';

alter table public.categories enable row level security;

create policy "categories_select_all" on public.categories
  for select
  to anon, authenticated
  using (true);

insert into public.categories (slug, name, sort_order) values
  ('venue', 'Танхим', 10),
  ('restaurant', 'Ресторан', 20),
  ('hotel', 'Зочид буудал', 30),
  ('cafe', 'Кафе', 40),
  ('hall', 'Их танхим', 50),
  ('outdoor', 'Гадаа талбай', 60);

alter table public.venues
  add column category_id uuid references public.categories (id);

update public.venues v
set category_id = c.id
from public.categories c
where c.slug = v.category::text;

do $$
begin
  if exists (select 1 from public.venues where category_id is null) then
    raise exception 'Migration failed: venues.category_id not fully backfilled';
  end if;
end $$;

alter table public.venues alter column category_id set not null;

alter table public.venues drop column category;

drop type public.venue_category;

create index venues_category_id_idx on public.venues (category_id);
