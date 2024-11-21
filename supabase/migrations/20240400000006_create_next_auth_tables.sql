-- Création des tables manquantes pour NextAuth dans le schéma next_auth
CREATE TABLE IF NOT EXISTS next_auth.accounts (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    provider text NOT NULL,
    provider_account_id text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at bigint,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT accounts_pkey PRIMARY KEY (id),
    CONSTRAINT provider_unique UNIQUE (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS next_auth.sessions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
    session_token text NOT NULL,
    expires timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT session_token_unique UNIQUE (session_token)
);

CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT verification_tokens_pkey PRIMARY KEY (identifier, token)
);

-- Ajout des politiques RLS
ALTER TABLE next_auth.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Politiques pour accounts
CREATE POLICY "Service role has full access to accounts"
    ON next_auth.accounts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Politiques pour sessions
CREATE POLICY "Service role has full access to sessions"
    ON next_auth.sessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Politiques pour verification_tokens
CREATE POLICY "Service role has full access to verification_tokens"
    ON next_auth.verification_tokens
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON next_auth.accounts(user_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON next_auth.sessions(user_id); 