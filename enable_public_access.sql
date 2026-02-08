-- COPY THIS CONTENT AND RUN IT IN THE SUPABASE SQL EDITOR

-- 1. Enable Public Access to Organizations (so people can see your store name/logo)
drop policy if exists "Public can view organizations" on organizations;
create policy "Public can view organizations"
  on organizations for select
  using (true);

-- 2. Enable Public Access to Products (so people can see your catalog)
drop policy if exists "Public can view products" on products;
create policy "Public can view products"
  on products for select
  using (true);

-- 3. Verify policies are active
select * from pg_policies where tablename in ('organizations', 'products');
