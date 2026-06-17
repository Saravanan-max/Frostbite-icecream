
-- =========================
-- ROLES
-- =========================
create type public.app_role as enum ('admin', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can view their own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================
-- PROFILES
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone" on public.profiles
  for select to anon, authenticated using (true);
grant select on public.profiles to anon;

create policy "Users update their own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);
create policy "Users insert their own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================
-- CATEGORIES
-- =========================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
grant insert, update, delete on public.categories to authenticated;

alter table public.categories enable row level security;
create policy "Categories are public" on public.categories
  for select to anon, authenticated using (true);
create policy "Admins manage categories" on public.categories
  for all to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================
-- PRODUCTS
-- =========================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  short_description text,
  price_cents integer not null check (price_cents >= 0),
  image_url text,
  tags text[] not null default '{}',
  ingredients text[] not null default '{}',
  stock integer not null default 100,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.products to anon, authenticated;
grant all on public.products to service_role;
grant insert, update, delete on public.products to authenticated;

alter table public.products enable row level security;
create policy "Products are public" on public.products
  for select to anon, authenticated using (active = true or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage products" on public.products
  for all to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create index products_category_idx on public.products(category_id);
create index products_featured_idx on public.products(featured) where featured = true;

-- =========================
-- CART
-- =========================
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

grant select, insert, update, delete on public.cart_items to authenticated;
grant all on public.cart_items to service_role;

alter table public.cart_items enable row level security;
create policy "Users see own cart" on public.cart_items
  for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own cart" on public.cart_items
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own cart" on public.cart_items
  for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own cart" on public.cart_items
  for delete to authenticated using (auth.uid() = user_id);

-- =========================
-- ORDERS
-- =========================
create type public.order_status as enum ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.order_status not null default 'pending',
  total_cents integer not null check (total_cents >= 0),
  shipping_name text,
  shipping_address text,
  shipping_city text,
  shipping_postal text,
  shipping_country text,
  stripe_session_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;

alter table public.orders enable row level security;
create policy "Users view own orders" on public.orders
  for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Users create own orders" on public.orders
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins update orders" on public.orders
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create index orders_user_idx on public.orders(user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0)
);

grant select, insert on public.order_items to authenticated;
grant all on public.order_items to service_role;

alter table public.order_items enable row level security;
create policy "Users view own order items" on public.order_items
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(), 'admin')))
  );
create policy "Users insert own order items" on public.order_items
  for insert to authenticated with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create index order_items_order_idx on public.order_items(order_id);
