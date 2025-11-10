-- Add pinned column to chat_sessions table
ALTER TABLE public.chat_sessions
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- Create index for better performance when filtering pinned sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_pinned ON public.chat_sessions(user_id, pinned, updated_at DESC);