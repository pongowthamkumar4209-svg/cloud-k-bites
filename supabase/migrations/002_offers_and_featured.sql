-- ============================================================
-- Cloud K Bites — Migration v2
-- Run this in Supabase SQL Editor AFTER the first migration
-- ============================================================

-- 1. ADD OFFERS TABLE (admin can manage these from dashboard)
create table if not exists public.offers (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  badge       text,
  discount_pct int default 0,         -- e.g. 20 for 20% off
  is_active   boolean not null default true,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- 2. ADD featured flag to products
alter table public.products
  add column if not exists is_featured boolean not null default false;

-- 3. RLS for offers
alter table public.offers enable row level security;
create policy "offers_public_read"   on public.offers for select using (true);
create policy "offers_public_insert" on public.offers for insert with check (true);
create policy "offers_public_update" on public.offers for update using (true);
create policy "offers_public_delete" on public.offers for delete using (true);

-- 4. Seed default offers
insert into public.offers (title, description, badge, discount_pct, is_active, sort_order) values
  ('20% Off Cupcakes!',       'This weekend only — grab your favorites',   'Weekend Special', 20, true, 1),
  ('Free Delivery on ₹500+',  'No delivery charges on orders above ₹500',  'Free Delivery',   0,  true, 2),
  ('Combo: 6 Cupcakes @ ₹499','Mix & match any 6 cupcakes',               'Combo Deal',      0,  true, 3)
on conflict do nothing;

-- 5. Mark featured products (ones with offer price)
update public.products set is_featured = true
where name in ('Vanilla Dream Cupcake','Strawberry Bliss Cake','Veg Club Sandwich','Chicken Popcorn');
