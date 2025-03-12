-- Create a function to execute SQL queries
-- This function is used by the setup scripts to execute SQL
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Grant execute permission to authenticated users
-- Note: In production, you should restrict this to specific roles
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;

-- Add a comment to the function
COMMENT ON FUNCTION exec_sql IS 'Execute SQL queries. Use with caution as this is a powerful function.'; 