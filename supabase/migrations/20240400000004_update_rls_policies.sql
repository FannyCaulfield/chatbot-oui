 -- Update RLS policies to use next_auth.uid()
DROP POLICY IF EXISTS "Allow full access to own workspaces" ON workspaces;
CREATE POLICY "Allow full access to own workspaces"
    ON workspaces
    USING (user_id = next_auth.uid())
    WITH CHECK (user_id = next_auth.uid());

-- Continue with other policy updates...