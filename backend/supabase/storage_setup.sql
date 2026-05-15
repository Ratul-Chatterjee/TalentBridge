-- TalentBridge Supabase Storage setup
-- Run this in Supabase SQL Editor for your project.

-- Create the bucket needed for resume uploads (idempotent)
insert into storage.buckets (id, name, public)
values
  ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Optional: remove old policy first if rerunning.
drop policy if exists "Allow service role full access resumes" on storage.objects;

-- Restrict object operations to service role only.
create policy "Allow service role full access resumes"
on storage.objects
for all
to service_role
using (bucket_id = 'resumes')
with check (bucket_id = 'resumes');
