-- Create a comprehensive logging table for application errors and debugging
-- This table will store all errors, warnings, and debugging information

CREATE TABLE IF NOT EXISTS app_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('ERROR', 'WARNING', 'INFO', 'DEBUG')),
    source VARCHAR(100) NOT NULL, -- e.g., 'update_entity', 'create_email', 'form_submission'
    action VARCHAR(100) NOT NULL, -- e.g., 'form_submit', 'database_update', 'validation'
    message TEXT NOT NULL,
    details JSONB, -- For storing additional structured data like form data, error objects, etc.
    stack_trace TEXT, -- For storing full stack traces
    user_id UUID, -- Optional: if you want to track which user caused the error
    session_id VARCHAR(255), -- Optional: for tracking user sessions
    ip_address INET, -- Optional: for security tracking
    user_agent TEXT, -- Optional: browser/client information
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_app_logs_timestamp ON app_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_app_logs_level ON app_logs(level);
CREATE INDEX IF NOT EXISTS idx_app_logs_source ON app_logs(source);
CREATE INDEX IF NOT EXISTS idx_app_logs_action ON app_logs(action);
CREATE INDEX IF NOT EXISTS idx_app_logs_user_id ON app_logs(user_id);

-- Add comments for documentation
COMMENT ON TABLE app_logs IS 'Application logging table for errors, warnings, and debugging information';
COMMENT ON COLUMN app_logs.level IS 'Log level: ERROR, WARNING, INFO, DEBUG';
COMMENT ON COLUMN app_logs.source IS 'Source of the log entry (e.g., update_entity, create_email)';
COMMENT ON COLUMN app_logs.action IS 'Action being performed (e.g., form_submit, database_update)';
COMMENT ON COLUMN app_logs.message IS 'Main log message';
COMMENT ON COLUMN app_logs.details IS 'Additional structured data in JSON format';
COMMENT ON COLUMN app_logs.stack_trace IS 'Full stack trace for errors';
COMMENT ON COLUMN app_logs.user_id IS 'Optional user ID who triggered the log entry';
COMMENT ON COLUMN app_logs.session_id IS 'Optional session ID for tracking user sessions';

-- Create a function to easily insert log entries
CREATE OR REPLACE FUNCTION log_app_event(
    p_level VARCHAR(20),
    p_source VARCHAR(100),
    p_action VARCHAR(100),
    p_message TEXT,
    p_details JSONB DEFAULT NULL,
    p_stack_trace TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_session_id VARCHAR(255) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO app_logs (
        level,
        source,
        action,
        message,
        details,
        stack_trace,
        user_id,
        session_id,
        ip_address,
        user_agent
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
        p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Create a view for easier querying of recent errors
CREATE OR REPLACE VIEW recent_errors AS
SELECT 
    timestamp,
    source,
    action,
    message,
    details,
    stack_trace,
    user_id
FROM app_logs 
WHERE level = 'ERROR' 
ORDER BY timestamp DESC;

-- Create a view for debugging information
CREATE OR REPLACE VIEW debug_logs AS
SELECT 
    timestamp,
    source,
    action,
    message,
    details
FROM app_logs 
WHERE level = 'DEBUG' 
ORDER BY timestamp DESC;

-- Example usage:
-- SELECT log_app_event('ERROR', 'update_entity', 'form_submission', 'Failed to update entity', '{"entity_id": "123", "error_code": "23514"}', 'Stack trace here...');
-- SELECT log_app_event('DEBUG', 'update_entity', 'form_submission', 'Form data received', '{"form_data": {"name": "Test", "type": "Business"}}');
-- SELECT log_app_event('INFO', 'update_entity', 'database_update', 'Entity updated successfully', '{"entity_id": "123"}');

-- Verify the table was created
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'app_logs' 
ORDER BY ordinal_position; 