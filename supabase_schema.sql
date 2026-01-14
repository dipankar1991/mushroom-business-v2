-- Create Transactions Table (Schema V2)
-- Drop existing table if you want to start fresh (WARNING: Deletes data)
-- drop table if exists public.transactions;

create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  type text not null check (type in ('expense', 'funding', 'revenue')),
  category text not null,
  subcategory text,
  description text not null,
  debit numeric default 0,
  credit numeric default 0,
  notes text,
  user_id uuid default auth.uid()
);

-- Enable Row Level Security (RLS)
alter table public.transactions enable row level security;

-- Allow public access (Simple mode)
create policy "Enable all access for all users" on "public"."transactions"
as PERMISSIVE for ALL
to public
using (true)
with check (true);
