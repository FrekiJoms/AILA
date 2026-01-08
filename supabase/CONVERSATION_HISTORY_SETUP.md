# Conversation History Setup

To set up conversation history, run the following SQL in your Supabase SQL editor:

```sql
-- Ensure extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS public;

-- Create the conversation_history table (idempotent)
CREATE TABLE IF NOT EXISTS public.conversation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  messages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_user_id ON public.conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_updated_at ON public.conversation_history(updated_at DESC);

-- Enable RLS
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- RLS policies (use SELECT auth.uid() for plan stability)
CREATE POLICY "Users can view their own conversations"
  ON public.conversation_history
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.conversation_history
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.conversation_history
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.conversation_history
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id);
```

After running this SQL, the conversation history feature will be fully functional!
