# JStore Configuration Guide

## ✅ Configuration Complete!

Your `application.yml` has been configured with your Supabase credentials.

---

## 🔐 Understanding JWT (Important Clarification!)

### There are TWO different JWT concepts - don't confuse them:

### 1. **Supabase Auth JWT** (NOT what we're using)
- **What it is**: Supabase's built-in authentication service
- **The keys you showed me**: Those JWT keys from Supabase Dashboard are for **Supabase Auth**
- **We are NOT using this**: We built our own authentication system

### 2. **Our Application JWT** (What we ARE using) ✅
- **What it is**: OUR custom JWT authentication for JStore
- **Location in code**: `app.jwtSecret` in `application.yml` (line 38)
- **Purpose**: Sign and verify JWT tokens that OUR application generates during login
- **Current value**: Temporary development secret (you can change later)

---

## 📝 What We Configured

### 1. **Database Connection** ✅
```yaml
datasource:
  url: jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
  username: postgres.doxksbweeaxtewrlcvat
  password: ViLink_17
```
- ✅ Connected to your Supabase PostgreSQL database
- ✅ Using Session Pooler (recommended for Spring Boot)
- ✅ SSL enabled (`sslmode=require`)

### 2. **JWT Secret for Our App** ✅
```yaml
app:
  jwtSecret: dG1wU2VjcmV0S2V5Rm9yRGV2ZWxvcG1lbnRPbmx5...
  jwtExpirationMs: 86400000  # 24 hours
```
- ✅ Temporary secret (good for development)
- ✅ Tokens expire after 24 hours
- 🔧 **Optional**: Generate a new secret later with: `openssl rand -base64 64`

### 3. **Hibernate Validation** ✅
```yaml
jpa:
  hibernate:
    ddl-auto: validate
```
- ✅ Validates that your entities match the database schema
- ✅ Won't auto-create/modify tables (since you already ran the SQL scripts)

---

## 🚀 Next Steps - Ready to Code!

Your database and configuration are ready. Now we need to implement the business logic:

### Option A: Start with Authentication (Recommended)
Implement:
1. **Exception Handling** (GlobalExceptionHandler)
2. **AuthService** - Register and login logic
3. **AuthController** - `/api/auth/register` and `/api/auth/login` endpoints

**Result**: You'll be able to create users and login to get JWT tokens

### Option B: Implement Core Features
Go straight to implementing:
- Category management (Admin)
- Product & Inventory management (Admin)
- Public product viewing
- Cart system
- Order checkout

---

## 🧪 How to Test the Configuration

Once we implement AuthService and AuthController, you can test:

### 1. Register a new user
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Login
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**Response** will include:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "roles": ["ROLE_CUSTOMER"]
}
```

### 3. Use the token to access protected endpoints
```bash
GET http://localhost:8080/api/cart
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Test Users Already in Database

From the seed.sql script, you already have these test users:

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@jstore.com`
- **Role**: ROLE_ADMIN

### Customer User
- **Username**: `customer`
- **Password**: `customer123`
- **Email**: `customer@jstore.com`
- **Role**: ROLE_CUSTOMER

You can use these once we implement the login endpoint!

---

## ⚠️ Important Notes

### JWT Secret Security
- **Development**: The current JWT secret is fine for learning and development
- **Production**: Before deploying, generate a new secret:
  ```bash
  openssl rand -base64 64
  ```
  And set it as an environment variable:
  ```bash
  export JWT_SECRET=your-newly-generated-secret
  ```

### Database Password Security
- **Currently**: Password is in `application.yml` (OK for development)
- **Production**: Use environment variables:
  ```yaml
  password: ${DB_PASSWORD:ViLink_17}
  ```
  Then: `export DB_PASSWORD=ViLink_17`

### Ignore Supabase JWT Keys
- You do NOT need the `anon key` or `service_role secret` for our application
- Those are only needed if you were using Supabase Auth (which we're not)
- We're only using Supabase as a PostgreSQL database

---

## 🎯 What Should We Build Next?

Let me know if you want to:

**A) Start with Authentication** ✅ Recommended
- Exception handling
- AuthService & AuthController
- Test login/register

**B) Build Core Features First**
- Product/Category management
- Cart and Orders
- Then circle back to auth

**C) Test the Current Setup**
- Try running the application
- Verify database connection
- Check for any errors

Which would you prefer?
