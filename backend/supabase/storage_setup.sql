-- TalentBridge Supabase Storage setup
-- Run this in Supabase SQL Editor for your project.

-- Create buckets (idempotent)
insert into storage.buckets (id, name, public)
values
  ('jds', 'jds', false),
  ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Optional: remove old policies first if rerunning.
drop policy if exists "Allow service role full access jds" on storage.objects;
drop policy if exists "Allow service role full access resumes" on storage.objects;

-- Restrict object operations to service role only.
create policy "Allow service role full access jds"
on storage.objects
for all
to service_role
using (bucket_id = 'jds')
with check (bucket_id = 'jds');

create policy "Allow service role full access resumes"
on storage.objects
for all
to service_role
using (bucket_id = 'resumes')
with check (bucket_id = 'resumes');
