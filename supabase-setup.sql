-- Optional Supabase setup for Birajdar Travels booking engine
-- Run in Supabase SQL Editor: https://supabase.com/dashboard

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_ref text unique not null,
  created_at timestamptz default now(),
  status text default 'pending_confirmation',
  payment_status text default 'awaiting_payment',
  service_type text not null,
  service_label text,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  travel_date date,
  traveling_from text,
  pickup text,
  drop_location text,
  adults int default 0,
  child_half int default 0,
  child_free int default 0,
  vehicle text,
  estimated_total int,
  special_notes text,
  booking_data jsonb
);

alter table bookings enable row level security;

-- Allow anonymous inserts (website bookings) and reads (admin with anon key)
create policy "Allow public insert" on bookings for insert with check (true);
create policy "Allow public select" on bookings for select using (true);
create policy "Allow public update" on bookings for update using (true);

create index if not exists bookings_ref_idx on bookings (booking_ref);
create index if not exists bookings_created_idx on bookings (created_at desc);
