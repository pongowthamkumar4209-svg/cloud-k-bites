-- ============================================================
-- Cloud K Bites — Supabase Database Schema
-- HOW TO RUN:
--   1. Go to https://supabase.com/dashboard
--   2. Open your project → SQL Editor
--   3. Paste this entire file and click Run
-- ============================================================

-- 1. PRODUCTS TABLE
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text,
  price            numeric(10,2) not null,
  offer_price      numeric(10,2),
  image            text,
  category         text not null,
  diet_type        text not null default 'veg',
  is_available     boolean not null default true,
  is_advance_order boolean not null default false,
  created_at       timestamptz default now()
);

-- 2. ORDERS TABLE
create table if not exists public.orders (
  id                   text primary key,
  customer_name        text not null,
  customer_phone       text not null,
  customer_email       text,
  delivery_address     text not null,
  notes                text,
  subtotal             numeric(10,2) not null,
  delivery_charge      numeric(10,2) not null default 0,
  grand_total          numeric(10,2) not null,
  payment_method       text not null default 'cod',
  payment_status       text not null default 'pending',
  razorpay_order_id    text,
  razorpay_payment_id  text,
  order_status         text not null default 'placed',
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- 3. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      text not null references public.orders(id) on delete cascade,
  product_id    text not null,
  name          text not null,
  price         numeric(10,2) not null,
  quantity      int not null,
  delivery_date text,
  delivery_time text
);

-- 4. INDEXES
create index if not exists idx_orders_phone   on public.orders(customer_phone);
create index if not exists idx_orders_status  on public.orders(order_status);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_items_order    on public.order_items(order_id);

-- 5. AUTO-UPDATE updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_orders_updated on public.orders;
create trigger on_orders_updated
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

-- 6. ROW LEVEL SECURITY
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Products: public read
create policy "products_public_read"   on public.products    for select using (true);
-- Orders: anyone can insert (place order) and read (for tracking)
create policy "orders_public_insert"   on public.orders      for insert with check (true);
create policy "orders_public_read"     on public.orders      for select using (true);
create policy "orders_public_update"   on public.orders      for update using (true);
create policy "items_public_insert"    on public.order_items for insert with check (true);
create policy "items_public_read"      on public.order_items for select using (true);

-- 7. SEED PRODUCTS
insert into public.products (name, description, price, offer_price, image, category, diet_type, is_available, is_advance_order) values
  ('Vanilla Dream Cupcake',    'Fluffy vanilla cupcake topped with silky buttercream frosting and rainbow sprinkles.',              120,  99,  'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400&h=400&fit=crop', 'cupcakes',    'egg',     true,  false),
  ('Red Velvet Cupcake',       'Classic red velvet with cream cheese frosting — a timeless favorite.',                             140,  null,'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=400&fit=crop', 'cupcakes',    'egg',     true,  false),
  ('Chocolate Truffle Cupcake','Rich chocolate base with ganache swirl and cocoa dust.',                                           130,  null,'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=400&fit=crop', 'cupcakes',    'egg',     true,  false),
  ('Strawberry Bliss Cake',    'Three-layer strawberry cake with fresh berries and whipped cream. Perfect for celebrations.',      899,  749, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop', 'cakes',       'egg',     true,  true),
  ('Classic Chocolate Cake',   'Dense, moist chocolate cake with dark ganache. A chocolate lover''s dream.',                      799,  null,'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop', 'cakes',       'egg',     true,  true),
  ('Pineapple Cake',           'Light sponge cake with pineapple filling and cream frosting.',                                     699,  null,'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop', 'cakes',       'egg',     true,  true),
  ('Veg Club Sandwich',        'Loaded with fresh veggies, cheese, and our special sauce on toasted bread.',                      149,  129, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop', 'quick-bites', 'veg',     true,  false),
  ('Egg Mayo Sandwich',        'Creamy egg mayo with lettuce and pepper on soft white bread.',                                     129,  null,'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=400&fit=crop', 'quick-bites', 'egg',     true,  false),
  ('Chicken Popcorn',          'Crispy bite-sized chicken pieces with special seasoning.',                                         199,  179, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop', 'quick-bites', 'non-veg', true,  false),
  ('Chicken Nuggets',          'Golden fried chicken nuggets served with dipping sauce.',                                          219,  null,'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=400&h=400&fit=crop', 'quick-bites', 'non-veg', true,  false),
  ('Chicken Grilled Sandwich', 'Grilled chicken breast with veggies and mayo on artisan bread.',                                   189,  null,'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=400&fit=crop', 'quick-bites', 'non-veg', true,  false),
  ('Butterscotch Cupcake',     'Caramel butterscotch cupcake with crunchy praline topping.',                                       110,  null,'https://images.unsplash.com/photo-1519869325930-281384150729?w=400&h=400&fit=crop', 'cupcakes',    'veg',     true,  false)
on conflict do nothing;
