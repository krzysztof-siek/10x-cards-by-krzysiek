-- Migration: Create generations table
-- Description: Creates the generations table with RLS policies
-- Author: AI Assistant
-- Date: 2024-03-26

-- Create generations table
create table generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create indexes
create index generations_user_id_idx on generations(user_id);

-- Enable RLS
alter table generations enable row level security;

-- Create trigger for updating updated_at
create or replace function update_generation_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_generation_updated_at
    before update on generations
    for each row
    execute function update_generation_updated_at();

-- Create RLS policies for authenticated users
create policy "Users can view their own generations"
    on generations
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own generations"
    on generations
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own generations"
    on generations
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own generations"
    on generations
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- Block anonymous access
create policy "No anonymous access to generations"
    on generations
    for all
    to anon
    using (false);

comment on table generations is 'Stores information about flashcard generation sessions'; 