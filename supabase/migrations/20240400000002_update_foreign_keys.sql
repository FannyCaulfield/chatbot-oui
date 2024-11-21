BEGIN;

-- Drop existing foreign keys
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.workspaces DROP CONSTRAINT IF EXISTS workspaces_user_id_fkey;
ALTER TABLE public.assistant_workspaces DROP CONSTRAINT IF EXISTS assistant_workspaces_user_id_fkey;
ALTER TABLE public.preset_workspaces DROP CONSTRAINT IF EXISTS preset_workspaces_user_id_fkey;
ALTER TABLE public.model_workspaces DROP CONSTRAINT IF EXISTS model_workspaces_user_id_fkey;

-- Add new foreign keys
ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.workspaces 
    ADD CONSTRAINT workspaces_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.assistant_workspaces 
    ADD CONSTRAINT assistant_workspaces_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.preset_workspaces 
    ADD CONSTRAINT preset_workspaces_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.model_workspaces 
    ADD CONSTRAINT model_workspaces_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

COMMIT;