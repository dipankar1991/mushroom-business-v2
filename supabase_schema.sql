-- Create Transactions Table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  type text not null check (type in ('expense', 'funding', 'revenue')),
  category text not null,
  subcategory text,
  description text not null,
  amount numeric not null,
  notes text,
  user_id uuid default auth.uid()
);

-- Enable Row Level Security (RLS)
alter table public.transactions enable row level security;

-- Create Policy: Allow public read/write for now given the 4-5 user requirement shared login scenario
-- OR: better to just allow full access if they are using one account or anon key.
-- Since user asked for "Free", and simple. Let's assume they use the API key which has access if RLS is off or configured.

-- For simplicity in this "mock" phase instructions:
create policy "Enable all access for all users" on "public"."transactions"
as PERMISSIVE for ALL
to public
using (true)
with check (true);
