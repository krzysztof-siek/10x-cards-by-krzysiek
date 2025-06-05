-- Migration: Create flashcards table
-- Description: Creates the flashcards table with RLS policies
-- Author: AI Assistant
-- Date: 2024-03-26

-- Create enum for flashcard source
create type flashcard_source as enum ('ai-full', 'ai-edited', 'manual');

-- Create flashcards table
create table flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source flashcard_source not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint references generations(id) on delete set null,
    user_id uuid not null references auth.users(id) on delete cascade
);

-- Create indexes
create index flashcards_user_id_idx on flashcards(user_id);
create index flashcards_generation_id_idx on flashcards(generation_id);

-- Enable RLS
alter table flashcards enable row level security;

-- Create trigger for updating updated_at
create or replace function update_flashcard_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_flashcard_updated_at
    before update on flashcards
    for each row
    execute function update_flashcard_updated_at();

-- Create RLS policies for authenticated users
create policy "Users can view their own flashcards"
    on flashcards
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own flashcards"
    on flashcards
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
    on flashcards
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
    on flashcards
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- Block anonymous access
create policy "No anonymous access to flashcards"
    on flashcards
    for all
    to anon
    using (false);

comment on table flashcards is 'Stores user flashcards with front and back content'; 