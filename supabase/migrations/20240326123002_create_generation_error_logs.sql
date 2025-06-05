-- Migration: Create generation error logs table
-- Description: Creates the generation error logs table with RLS policies
-- Author: AI Assistant
-- Date: 2024-03-26

-- Create generation_error_logs table
create table generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Create indexes
create index generation_error_logs_user_id_idx on generation_error_logs(user_id);

-- Enable RLS
alter table generation_error_logs enable row level security;

-- Create RLS policies for authenticated users
create policy "Users can view their own error logs"
    on generation_error_logs
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own error logs"
    on generation_error_logs
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Block all other operations for authenticated users
create policy "Users cannot update error logs"
    on generation_error_logs
    for update
    to authenticated
    using (false);

create policy "Users cannot delete error logs"
    on generation_error_logs
    for delete
    to authenticated
    using (false);

-- Block anonymous access
create policy "No anonymous access to error logs"
    on generation_error_logs
    for all
    to anon
    using (false);

comment on table generation_error_logs is 'Stores error logs from flashcard generation attempts'; 