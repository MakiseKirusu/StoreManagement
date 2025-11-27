-- Grant ADMIN role to jstore_admin user
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

DO $$
DECLARE
    user_id_var BIGINT;
    admin_role_id BIGINT;
BEGIN
    -- Get the user ID for jstore_admin
    SELECT id INTO user_id_var FROM users WHERE username = 'jstore_admin';

    -- Get the ADMIN role ID
    SELECT id INTO admin_role_id FROM roles WHERE name = 'ROLE_ADMIN';

    -- Assign ADMIN role to the user
    INSERT INTO user_roles (user_id, role_id)
    VALUES (user_id_var, admin_role_id)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Admin role granted to jstore_admin successfully!';
END $$;

-- Verify the role was assigned
SELECT u.username, u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'jstore_admin';
