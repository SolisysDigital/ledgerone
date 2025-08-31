-- Fix Database Functions for LedgerOne
-- This script creates missing functions that are causing build failures

-- 1. Create the missing insert_app_log function
CREATE OR REPLACE FUNCTION public.insert_app_log(
  p_level text,
  p_source text,
  p_action text,
  p_message text,
  p_details jsonb DEFAULT NULL,
  p_stack_trace text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  -- Insert the log entry
  INSERT INTO public.app_logs (
    level,
    source,
    action,
    message,
    details,
    stack_trace,
    user_id,
    session_id,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    p_level,
    p_source,
    p_action,
    p_message,
    p_details,
    p_stack_trace,
    p_user_id,
    p_session_id,
    p_ip_address,
    p_user_agent,
    NOW()
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error to console for debugging
    RAISE LOG 'Error in insert_app_log: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- 2. Ensure app_logs table exists with proper structure
CREATE TABLE IF NOT EXISTS public.app_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  level text NOT NULL,
  source text NOT NULL,
  action text NOT NULL,
  message text NOT NULL,
  details jsonb,
  stack_trace text,
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  ip_address text,
  user_agent text,
  timestamp timestamptz DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_logs_timestamp ON public.app_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_app_logs_level ON public.app_logs(level);
CREATE INDEX IF NOT EXISTS idx_app_logs_source ON public.app_logs(source);
CREATE INDEX IF NOT EXISTS idx_app_logs_user_id ON public.app_logs(user_id);

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.insert_app_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_app_log TO service_role;
GRANT ALL ON public.app_logs TO service_role;
GRANT SELECT ON public.app_logs TO authenticated;

-- 5. Enable RLS on app_logs table
ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for app_logs
DROP POLICY IF EXISTS "Users can view their own logs" ON public.app_logs;
CREATE POLICY "Users can view their own logs" ON public.app_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all logs" ON public.app_logs;
CREATE POLICY "Service role can manage all logs" ON public.app_logs
  FOR ALL USING (auth.role() = 'service_role');

-- 7. Verify the function was created
SELECT 
  routine_name, 
  routine_type, 
  data_type 
FROM information_schema.routines 
WHERE routine_name = 'insert_app_log' 
AND routine_schema = 'public';

-- 8. Test the function (optional - comment out if you don't want to create test data)
-- SELECT public.insert_app_log(
--   'info',
--   'test',
--   'test_function',
--   'Testing insert_app_log function',
--   '{"test": true}'::jsonb
-- );
