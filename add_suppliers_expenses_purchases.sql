-- Create Suppliers Table
create table suppliers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users default auth.uid() not null,
  name text not null,
  contact text,
  email text,
  address text
);

-- Create Expenses Table
create table expenses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users default auth.uid() not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  description text not null,
  amount numeric not null,
  category text,
  supplier_id uuid references suppliers(id) on delete set null
);

-- Create Purchases Table
create table purchases (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users default auth.uid() not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  supplier_id uuid references suppliers(id) on delete set null,
  total numeric not null,
  items jsonb -- Stores array of items: { product_id, quantity, cost }
);

-- Enable RLS
alter table suppliers enable row level security;
alter table expenses enable row level security;
alter table purchases enable row level security;

-- Suppliers Policies
create policy "Users can view their own suppliers"
  on suppliers for select using (auth.uid() = user_id);

create policy "Users can insert their own suppliers"
  on suppliers for insert with check (auth.uid() = user_id);

create policy "Users can update their own suppliers"
  on suppliers for update using (auth.uid() = user_id);

create policy "Users can delete their own suppliers"
  on suppliers for delete using (auth.uid() = user_id);

-- Expenses Policies
create policy "Users can view their own expenses"
  on expenses for select using (auth.uid() = user_id);

create policy "Users can insert their own expenses"
  on expenses for insert with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on expenses for update using (auth.uid() = user_id);

create policy "Users can delete their own expenses"
  on expenses for delete using (auth.uid() = user_id);

-- Purchases Policies
create policy "Users can view their own purchases"
  on purchases for select using (auth.uid() = user_id);

create policy "Users can insert their own purchases"
  on purchases for insert with check (auth.uid() = user_id);

create policy "Users can update their own purchases"
  on purchases for update using (auth.uid() = user_id);

create policy "Users can delete their own purchases"
  on purchases for delete using (auth.uid() = user_id);
