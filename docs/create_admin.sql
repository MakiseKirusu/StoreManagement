-- Create admin user (password is 'admin123' hashed with BCrypt)
INSERT INTO users (username, email, password, created_at, updated_at) 
VALUES ('admin', 'admin@jstore.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.mK3UXQMd7y4KpPPQqp0n0P1QYzPrC1q', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Get the admin user ID
DO $$
DECLARE
    admin_user_id BIGINT;
    admin_role_id BIGINT;
BEGIN
    SELECT id INTO admin_user_id FROM users WHERE username = 'admin';
    SELECT id INTO admin_role_id FROM roles WHERE name = 'ROLE_ADMIN';
    
    -- Assign ADMIN role to admin user
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id)
    ON CONFLICT DO NOTHING;
END $$;
