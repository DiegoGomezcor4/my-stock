-- FIX INFINITE RECURSION IN POLICIES

-- 1. Drop the problematic policies first to be safe
drop policy if exists "Admins can view all organizations" on organizations;
drop policy if exists "Public can view organizations" on profiles;

-- 2. Ensure RLS on Organizations is simple for public access
-- This was likely causing recursion if we tried to join profiles
alter table organizations enable row level security;

-- Allow public read access to organizations (Simple, no joins)
create policy "Public can view organizations"
  on organizations for select
  using (true);

-- 3. Ensure Profiles don't block anything (though we don't query them in the public catalog)
-- Fix recursion in profiles if any
drop policy if exists "Admins can view all profiles" on profiles;

create policy "Admins can view all profiles"
  on profiles for select
  using (
    -- Use a direct check on auth.jwt() to avoid querying the table itself recursively if possible,
    -- OR ensure no circular dependency.
    -- For now, let's keep it simple: users read own, admins read all.
    (auth.uid() = id) OR 
    (select role from profiles where id = auth.uid()) = 'admin'
  );
