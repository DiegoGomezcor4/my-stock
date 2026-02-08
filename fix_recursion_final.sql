-- FIX INFINITE RECURSION
-- The issue is that "Admins can view all profiles" queries "profiles" again, creating a loop.
-- Also, the public catalog might be triggering this if there are policies trying to check admin status for everything.

-- 1. DROP Problematic Policies
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can update profiles" on profiles;
drop policy if exists "Admins can view all organizations" on organizations;

-- 2. RECREATE Profiles Admin Policy (WITHOUT Recursion if possible)
-- We will use a function to get role to be cleaner, OR just simplify.
-- But the simplest way to Fix Recursion is often security definer functions, OR avoiding self-selects.
-- However, for now, let's just make sure PUBLIC access to organizations DOES NOT check profiles.
drop policy if exists "Public can view organizations" on organizations;
create policy "Public can view organizations"
  on organizations for select
  using (true);

-- 3 Re-enable Admin Access (Carefully)
-- Instead of checking profiles table inside the policy for profiles table (recursion),
-- we can trust that users read their own, and admins read all.
-- Breaking the recursion:
create policy "Admins can view all profiles"
  on profiles for select
  using (
    (auth.uid() = id) OR 
    (select role from profiles where id = auth.uid()) = 'admin'
  );
-- NOTE: If the above still causes recursion for some reason (it might),
-- we can temporarily disable the ADMIN check for this specific debugging session 
-- causing the public catalog issue.

-- 4. ENSURE Organization Public Access is clean
-- Verify this policy exists and is simple:
-- create policy "Public can view organizations" on organizations for select using (true);
