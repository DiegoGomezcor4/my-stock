-- Create Organizations Table (Profile/Company Info)
create table organizations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text default 'Mi Empresa',
  logo_url text
);

-- Enable RLS on Organizations
alter table organizations enable row level security;

create policy "Users can view their own organization"
  on organizations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own organization"
  on organizations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own organization"
  on organizations for update
  using (auth.uid() = user_id);

-- Create Products Table
create table products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users default auth.uid() not null,
  name text not null,
  quantity integer default 0,
  price numeric default 0,
  cost numeric default 0,
  min_stock integer default 5,
  description text,
  image text
);

-- Create Customers Table
create table customers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users default auth.uid() not null,
  name text not null,
  contact text,
  email text
);

-- Create Sales Table
create table sales (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users default auth.uid() not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  total numeric not null,
  total_cost numeric default 0,
  customer_id uuid references customers(id),
  items jsonb -- Stores the array of items sold
);

-- Enable RLS
alter table products enable row level security;
alter table customers enable row level security;
alter table sales enable row level security;

-- Create Policies (SaaS / Multi-tenant isolation)

-- Products Policies
create policy "Users can view their own products"
  on products for select using (auth.uid() = user_id);

create policy "Users can insert their own products"
  on products for insert with check (auth.uid() = user_id);

create policy "Users can update their own products"
  on products for update using (auth.uid() = user_id);

create policy "Users can delete their own products"
  on products for delete using (auth.uid() = user_id);

-- Customers Policies
create policy "Users can view their own customers"
  on customers for select using (auth.uid() = user_id);

create policy "Users can insert their own customers"
  on customers for insert with check (auth.uid() = user_id);

create policy "Users can update their own customers"
  on customers for update using (auth.uid() = user_id);

create policy "Users can delete their own customers"
  on customers for delete using (auth.uid() = user_id);

-- Sales Policies
create policy "Users can view their own sales"
  on sales for select using (auth.uid() = user_id);

create policy "Users can insert their own sales"
  on sales for insert with check (auth.uid() = user_id);

create policy "Users can update their own sales"
  on sales for update using (auth.uid() = user_id); -- Usually sales shouldn't be updated, but for simplicity

create policy "Users can delete their own sales"
  on sales for delete using (auth.uid() = user_id);
