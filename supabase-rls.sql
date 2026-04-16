-- Run these in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Enable RLS on all tables
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table messages enable row level security;

-- 2. Profiles policies
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- 3. Tasks policies
create policy "Tasks are viewable by everyone" on tasks for select using (true);
create policy "Users can insert their own tasks" on tasks for insert with check (auth.uid() = user_id);
create policy "Users can update their own tasks" on tasks for update using (auth.uid() = user_id);

-- 4. Messages policies
create policy "Users can view their own messages" on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages" on messages for insert with check (auth.uid() = sender_id);

-- 5. Create availability table
create table availability (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  category text,
  available_days text[],
  rate text,
  notes text,
  created_at timestamp default now()
);

alter table availability enable row level security;
create policy "Availability is viewable by everyone" on availability for select using (true);
create policy "Users can insert their own availability" on availability for insert with check (auth.uid() = user_id);
create policy "Users can update their own availability" on availability for update using (auth.uid() = user_id);
