import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KNOWLEDGE_CHUNKS } from '../src/lib/knowledgeBase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeArray(arr) {
  if (!arr || !arr.length) return "'{}'";
  const items = arr.map((s) => `"${String(s).replace(/"/g, '\\"')}"`).join(',');
  return `'{${items}}'`;
}

let sql = `-- =============================================================================
-- Cropex Phase 3: Supabase pgvector Knowledge Base Migration & Seed Script
-- =============================================================================
-- Enables vector search, full-text search, and stores curated agricultural knowledge
-- chunks from PARC/NARC, DPP Pakistan, and provincial advisories.
-- =============================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create knowledge_chunks table
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id TEXT PRIMARY KEY,
  crop_id TEXT,
  disease_id TEXT,
  category TEXT NOT NULL CHECK (category IN ('disease_mgmt', 'pesticide', 'agronomy', 'advisory', 'general')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_ur TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  language TEXT DEFAULT 'en',
  tags TEXT[] DEFAULT '{}',
  embedding vector(1536), -- Compatible with OpenAI text-embedding-3-small or Gemini text-embedding-004
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on knowledge_chunks" ON public.knowledge_chunks;
CREATE POLICY "Allow public read access on knowledge_chunks"
  ON public.knowledge_chunks
  FOR SELECT
  USING (true);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_crop_id ON public.knowledge_chunks(crop_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_disease_id ON public.knowledge_chunks(disease_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_category ON public.knowledge_chunks(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_fts ON public.knowledge_chunks USING GIN (
  to_tsvector('english', title || ' ' || content)
);

-- HNSW Vector Cosine Distance Index (for pgvector semantic similarity)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding_hnsw
  ON public.knowledge_chunks
  USING hnsw (embedding vector_cosine_ops);

-- 5. RPC Function: match_knowledge_chunks
CREATE OR REPLACE FUNCTION match_knowledge_chunks (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 5,
  filter_crop_id text DEFAULT NULL
)
RETURNS TABLE (
  id text,
  crop_id text,
  disease_id text,
  category text,
  title text,
  content text,
  content_ur text,
  source text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.crop_id,
    kc.disease_id,
    kc.category,
    kc.title,
    kc.content,
    kc.content_ur,
    kc.source,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE
    (filter_crop_id IS NULL OR kc.crop_id = filter_crop_id OR kc.crop_id IS NULL)
    AND (kc.embedding IS NOT NULL)
    AND (1 - (kc.embedding <=> query_embedding) > match_threshold)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. Seed Data (Curated Knowledge Chunks)
`;

for (const c of KNOWLEDGE_CHUNKS) {
  sql += `INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  ${escapeSql(c.id)},
  ${escapeSql(c.crop_id)},
  ${escapeSql(c.disease_id)},
  ${escapeSql(c.category)},
  ${escapeSql(c.title)},
  ${escapeSql(c.content)},
  ${escapeSql(c.content_ur)},
  ${escapeSql(c.source)},
  ${escapeSql(c.source_url)},
  ${escapeSql(c.language || 'en')},
  ${escapeArray(c.tags)}
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

`;
}

const outputPath = path.resolve(__dirname, '../supabase_seed_rag.sql');
fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Generated ${outputPath} (${sql.length} bytes, ${KNOWLEDGE_CHUNKS.length} chunks)`);
