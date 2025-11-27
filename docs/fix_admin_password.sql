-- Fix admin password
-- This updates the admin user's password to 'Admin123!' (BCrypt hashed)
-- Generated with BCrypt rounds=10

UPDATE users
SET password = '$2a$10$dXJ3SW6G7P050LGyjt/YDuJ1d9xIfYDhZ5DLsLXSLGP0YEaQ6Tc7e',
    updated_at = NOW()
WHERE username = 'admin';

-- Ensure admin has ADMIN role
DO $$
DECLARE
    admin_user_id BIGINT;
    admin_role_id BIGINT;
BEGIN
    SELECT id INTO admin_user_id FROM users WHERE username = 'admin';
    SELECT id INTO admin_role_id FROM roles WHERE name = 'ROLE_ADMIN';

    -- Assign ADMIN role (if not already assigned)
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id)
    ON CONFLICT DO NOTHING;
END $$;
