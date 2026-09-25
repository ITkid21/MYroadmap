create table if not exists public.studyflow_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.studyflow_data enable row level security;

create policy "Users can read their own StudyFlow data"
  on public.studyflow_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own StudyFlow data"
  on public.studyflow_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own StudyFlow data"
  on public.studyflow_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
