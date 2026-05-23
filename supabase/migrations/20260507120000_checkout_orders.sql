-- Nairly guest/authenticated checkout orders (run in Supabase SQL editor or via CLI).
create table if not exists public.orders (
  id uuid not null default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  payment_method text not null check (payment_method in ('qpay', 'bank_transfer')),
  notes text,
  items jsonb not null default '[]',
  subtotal integer not null,
  total integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Allow inserts from the app (anon + logged-in users) via public anon key + server patterns.
create policy "orders_allow_insert" on public.orders
  for insert
  to anon, authenticated
  with check (true);

-- Users can read their own orders when logged in.
create policy "orders_select_owner" on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id);
