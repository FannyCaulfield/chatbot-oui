 -- Create NextAuth uid function
 
-- Update RLS policies
DROP POLICY IF EXISTS "Allow full access to own workspaces" ON workspaces;
CREATE POLICY "Allow full access to own workspaces"
    ON workspaces
    USING (user_id = next_auth.uid())
    WITH CHECK (user_id = next_auth.uid());

DROP POLICY IF EXISTS "Allow full access to own profiles" ON profiles;
CREATE POLICY "Allow full access to own profiles"
    ON profiles
    USING (user_id = next_auth.uid())
    WITH CHECK (user_id = next_auth.uid());

DROP POLICY IF EXISTS "Allow full access to own model_workspaces" ON model_workspaces;
CREATE POLICY "Allow full access to own model_workspaces"
    ON model_workspaces
    USING (user_id = next_auth.uid())
    WITH CHECK (user_id = next_auth.uid());

-- Update storage policies
DROP POLICY IF EXISTS "Allow authenticated insert access to own profile images" ON storage.objects;
CREATE POLICY "Allow authenticated insert access to own profile images"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'profile_images' AND (storage.foldername(name))[1] = next_auth.uid()::text);