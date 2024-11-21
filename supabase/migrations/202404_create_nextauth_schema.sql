-- Create the next_auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS next_auth;

-- Create NextAuth core tables
CREATE TABLE IF NOT EXISTS next_auth.users (
    id uuid NOT NULL,
    instance_id uuid NOT NULL,
    aud text NOT NULL,
    role text NOT NULL,
    email text,
    name text,
    is_sso_user boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT email_unique UNIQUE (email)
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA next_auth TO service_role;

-- Enable RLS
ALTER TABLE next_auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy for service_role
CREATE POLICY "Service role has full access"
    ON next_auth.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
