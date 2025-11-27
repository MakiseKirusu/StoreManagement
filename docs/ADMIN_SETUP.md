# Admin Account Setup Guide

## ⚠️ IMPORTANT: Admin Account Creation

This guide explains how to properly create an admin account for JStore.

---

## Problem History

During initial development, there were issues with admin account creation:
- Password hashing issues with BCrypt
- Role assignment not working properly
- Authentication failures

**Current Solution**: Use the existing admin account created during setup, or follow the steps below carefully.

---

## Method 1: Use Existing Admin Account (Recommended)

The application comes with a pre-configured admin account:

```
Username: jstore_admin
Password: Admin12345
```

**This account is ready to use and has been tested.**

---

## Method 2: Create New Admin Account via SQL

If you need to create a new admin account, use the SQL scripts in `docs/`:

### Step 1: Create the Admin User

Use the `create_admin.sql` script:

```sql
-- File: docs/create_admin.sql
INSERT INTO users (username, email, password, first_name, last_name, phone)
VALUES (
    'your_admin_username',
    'admin@yourstore.com',
    '$2a$10$YourHashedPasswordHere',  -- BCrypt hashed password
    'Admin',
    'User',
    '+1234567890'
);
```

**Important**: The password MUST be BCrypt hashed with strength 10. You can generate it using:
- Online tool: https://bcrypt-generator.com/ (use 10 rounds)
- Or use the backend's `/api/auth/hash-password` endpoint (if available)

### Step 2: Grant Admin Role

Use the `grant_admin_role.sql` script:

```sql
-- File: docs/grant_admin_role.sql
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.username = 'your_admin_username'
  AND r.name = 'ROLE_ADMIN';
```

### Step 3: Verify Setup

Run this query to verify:

```sql
SELECT u.username, u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'your_admin_username';
```

You should see:
```
username            | email                | role
--------------------|----------------------|------------
your_admin_username | admin@yourstore.com  | ROLE_ADMIN
```

---

## Method 3: Fix Existing Admin Password

If you have an admin account but forgot the password, use `fix_admin_password.sql`:

```sql
-- File: docs/fix_admin_password.sql
UPDATE users
SET password = '$2a$10$NewBCryptHashedPasswordHere'
WHERE username = 'jstore_admin';
```

---

## Testing Admin Login

### Via API (curl):

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jstore_admin",
    "password": "Admin12345"
  }'
```

**Expected Response**:
```json
{
  "token": "eyJhbGci...",
  "type": "Bearer",
  "username": "jstore_admin",
  "email": "admin@jstore.com",
  "roles": ["ROLE_ADMIN"]
}
```

### Via Frontend:

1. Open: http://localhost:5173/login
2. Enter credentials
3. Click Login
4. Should redirect to dashboard with admin access

---

## Troubleshooting

### Issue: "Bad credentials" error

**Cause**: Password not properly BCrypt hashed

**Solution**:
1. Generate a new BCrypt hash (10 rounds)
2. Update password in database using `fix_admin_password.sql`

### Issue: User logs in but doesn't have admin access

**Cause**: ROLE_ADMIN not assigned

**Solution**:
1. Run `grant_admin_role.sql` with your username
2. Verify with the SELECT query above

### Issue: "User not found"

**Cause**: User doesn't exist in database

**Solution**:
1. Run `create_admin.sql` to create the user
2. Then run `grant_admin_role.sql` to assign role

---

## Security Notes

1. **Change Default Credentials**: In production, change the default admin password
2. **Strong Passwords**: Use BCrypt with minimum 10 rounds
3. **Environment Variables**: Store credentials in `.env` files, not in code
4. **Regular Rotation**: Rotate admin passwords periodically

---

## Available SQL Scripts

All scripts are located in `docs/`:

- `create_admin.sql` - Creates new admin user
- `grant_admin_role.sql` - Grants ROLE_ADMIN to existing user
- `fix_admin_password.sql` - Resets admin password

---

**Last Updated**: November 26, 2025
