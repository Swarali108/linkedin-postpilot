-- Migration: switch brand-memory embeddings from 384-dim (all-MiniLM-L6-v2)
-- to 768-dim (Gemini text-embedding-004).
--
-- Run this ONCE in the Supabase SQL editor if you created the schema before the
-- Gemini-embeddings switch. The memories table must be empty (re-add posts after).
-- Fresh setups can skip this — schema.sql already uses vector(768).

drop function if exists match_memories(vector, text, integer);
drop index if exists memories_embedding_idx;

alter table memories alter column embedding type vector(768);

create index memories_embedding_idx
  on memories using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create or replace function match_memories (
  query_embedding vector(768),
  match_user_id   text default 'local',
  match_count     int  default 3
)
returns table (
  id         uuid,
  text       text,
  type       text,
  created_at timestamptz,
  similarity float
)
language sql stable
set search_path = public
as $$
  select m.id, m.text, m.type, m.created_at,
         1 - (m.embedding <=> query_embedding) as similarity
  from memories m
  where m.user_id = match_user_id
  order by m.embedding <=> query_embedding
  limit match_count;
$$;
