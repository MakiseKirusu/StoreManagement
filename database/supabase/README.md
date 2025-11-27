# JStore Supabase Database Setup

This folder contains SQL scripts to set up the JStore database on Supabase PostgreSQL.

## 📋 Files Overview

- **`schema.sql`** - Creates all database tables, indexes, and constraints
- **`seed.sql`** - Inserts initial data (roles, sample products, test users, vouchers)
- **`README.md`** - This file with setup instructions

## 🚀 Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run schema.sql

1. Copy the entire contents of `schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** button (or press Ctrl/Cmd + Enter)
4. Wait for confirmation message: "Success. No rows returned"

This will create:
- 12 tables (users, roles, products, categories, inventory, carts, cart_items, orders, order_items, reviews, vouchers, notifications)
- Indexes for optimized queries
- Constraints and foreign keys
- Triggers for auto-updating timestamps

### Step 3: Run seed.sql

1. Create a new query in SQL Editor
2. Copy the entire contents of `seed.sql`
3. Paste it into the SQL Editor
4. Click **Run**

This will insert:
- 3 roles (ROLE_CUSTOMER, ROLE_STAFF, ROLE_ADMIN)
- 8 product categories
- 2 test users (admin and customer)
- 12+ sample products with inventory
- 4 sample vouchers

### Step 4: Verify Setup

Run this query to check if everything was created successfully:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check sample data
SELECT 'Roles' as table_name, COUNT(*) as count FROM roles
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'Vouchers', COUNT(*) FROM vouchers;
```

Expected results:
- 12 tables in public schema
- 3 roles
- 2 users
- 8 categories
- 12+ products
- Inventory records for all products
- 4 vouchers

## 🔐 Test User Credentials

After running seed.sql, you can use these test accounts:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@jstore.com`
- **Role**: ROLE_ADMIN

### Customer Account
- **Username**: `customer`
- **Password**: `customer123`
- **Email**: `customer@jstore.com`
- **Role**: ROLE_CUSTOMER

⚠️ **IMPORTANT**: Change these passwords immediately in production!

## 🔧 Configuration for Spring Boot

After running the SQL scripts, update your `application.yml` with your Supabase connection details:

### Get Connection String

1. Go to Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection String** section
3. Select **Session Pooler** mode (recommended for Spring Boot)
4. Copy the JDBC URL

### Update application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://[YOUR-PROJECT].[REGION].pooler.supabase.com:6543/postgres?sslmode=require
    username: postgres.[project-id]
    password: [YOUR-DB-PASSWORD]
```

### Get Your Values

- **Project URL**: Found in Settings → API → Project URL
  - Format: `https://[project-id].supabase.co`

- **Database Password**: The password you set when creating the project
  - If forgotten, go to Settings → Database → Reset Database Password

- **JWKS URI** (for JWT validation):
  ```yaml
  spring:
    security:
      oauth2:
        resourceserver:
          jwt:
            jwk-set-uri: https://[project-id].supabase.co/auth/v1/.well-known/jwks.json
  ```

## 🔄 Resetting the Database

If you need to start fresh, run this command in SQL Editor:

```sql
-- WARNING: This will delete ALL data
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then run `schema.sql` and `seed.sql` again.

## 📊 Useful Queries

### View all users with their roles
```sql
SELECT u.id, u.username, u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
ORDER BY u.id;
```

### View products with inventory
```sql
SELECT p.id, p.name, p.price, c.name as category, i.stock_quantity
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN inventory i ON p.id = i.product_id
ORDER BY p.id;
```

### View active vouchers
```sql
SELECT code, type, value, min_spend, expiry_date
FROM vouchers
WHERE expiry_date >= CURRENT_DATE
ORDER BY expiry_date;
```

## 🆘 Troubleshooting

### Error: "relation already exists"
- Solution: The tables are already created. Either skip schema.sql or reset the database.

### Error: "permission denied"
- Solution: Make sure you're using the correct database password and have proper permissions.

### Error: "could not connect to server"
- Solution: Check your internet connection and verify the connection string is correct.

### Products have no inventory
- Solution: Make sure you ran seed.sql after schema.sql. Seed.sql creates inventory for all products.

## 📚 Next Steps

After database setup:

1. ✅ Configure Spring Boot `application.yml` with Supabase credentials
2. ✅ Start your Spring Boot application
3. ✅ Test the `/api/auth/login` endpoint with test credentials
4. ✅ Verify database connectivity in application logs
5. ✅ Begin implementing API endpoints

## 🔒 Security Recommendations

1. **Change default passwords** immediately
2. **Enable Row Level Security (RLS)** in production
3. **Use environment variables** for sensitive credentials
4. **Rotate JWT secrets** regularly
5. **Enable SSL** for all database connections (already in connection string)

## 📝 Notes

- The schema uses **BIGSERIAL** for ID columns (auto-incrementing Long values in Java)
- **BCrypt** is used for password hashing (compatible with Spring Security)
- **Timestamps** are automatically managed via triggers
- **Cascading deletes** are configured where appropriate
- **Check constraints** ensure data integrity (e.g., price > 0, rating 1-5)

---

Need help? Check the Supabase documentation: https://supabase.com/docs
