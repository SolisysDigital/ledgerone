-- Create the missing insert_app_log function that the logger is trying to call
-- This function will insert log entries into the app_logs table

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
SET search_path = public
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_app_log TO authenticated;

-- Grant execute permission to service_role (for server-side operations)
GRANT EXECUTE ON FUNCTION public.insert_app_log TO service_role;

-- Comment on the function
COMMENT ON FUNCTION public.insert_app_log IS 'Insert a log entry into the app_logs table with proper error handling';
