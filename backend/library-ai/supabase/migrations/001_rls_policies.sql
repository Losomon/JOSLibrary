-- FULL RLS POLICIES for JOSLibrary (12 tables) - Member/Librarian/Admin/Webhook safe
-- Run this in Supabase SQL Editor after schema/migrations

-- 1. PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid()
