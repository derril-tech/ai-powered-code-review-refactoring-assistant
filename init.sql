-- Enable pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the database if it doesn't exist
-- (This is handled by the POSTGRES_DB environment variable)
