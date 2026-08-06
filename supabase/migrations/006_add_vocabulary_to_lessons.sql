-- Structured vocabulary (term/phonetic/meaning/example sentence + real video timestamp)
-- for the Theory tab — replaces the freeform Markdown vocabulary table, which rendered
-- inconsistently between lessons since nothing forced the LLM to always use a table.
ALTER TABLE lessons ADD COLUMN vocabulary_json jsonb NOT NULL DEFAULT '[]'::jsonb;
