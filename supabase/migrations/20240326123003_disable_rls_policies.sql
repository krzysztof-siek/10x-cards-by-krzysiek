-- Migration: Disable RLS policies
-- Description: Disables all RLS policies for flashcards, generations, and generation_error_logs tables
-- Author: AI Assistant
-- Date: 2024-03-26

-- Disable RLS policies for flashcards
drop policy if exists "Users can view their own flashcards" on flashcards;
drop policy if exists "Users can create their own flashcards" on flashcards;
drop policy if exists "Users can update their own flashcards" on flashcards;
drop policy if exists "Users can delete their own flashcards" on flashcards;
drop policy if exists "No anonymous access to flashcards" on flashcards;

-- Disable RLS policies for generations
drop policy if exists "Users can view their own generations" on generations;
drop policy if exists "Users can create their own generations" on generations;
drop policy if exists "Users can update their own generations" on generations;
drop policy if exists "Users can delete their own generations" on generations;
drop policy if exists "No anonymous access to generations" on generations;

-- Disable RLS policies for generation_error_logs
drop policy if exists "Users can view their own generation error logs" on generation_error_logs;
drop policy if exists "Users can create their own generation error logs" on generation_error_logs;
drop policy if exists "Users can update their own generation error logs" on generation_error_logs;
drop policy if exists "Users can delete their own generation error logs" on generation_error_logs;
drop policy if exists "No anonymous access to generation error logs" on generation_error_logs;

-- Disable RLS on tables
alter table flashcards disable row level security;
alter table generations disable row level security;
alter table generation_error_logs disable row level security; 