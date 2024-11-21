-- Autoriser l'accès au schéma next_auth
GRANT USAGE ON SCHEMA next_auth TO postgres, anon, authenticated, service_role;

-- Autoriser l'accès aux tables
GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA next_auth TO anon, authenticated;

-- Autoriser l'accès aux sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA next_auth TO postgres, service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;