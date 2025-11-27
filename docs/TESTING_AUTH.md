# Testing Authentication - JStore API

## 🎉 Authentication Implementation Complete!

Your authentication system is now fully functional. Here's how to test it.

---

## ✅ What Was Implemented

### 1. **Exception Handling**
- ✅ GlobalExceptionHandler - Catches all exceptions
- ✅ Custom exceptions: ResourceNotFoundException, BadRequestException, InsufficientStockException, DuplicateResourceException
- ✅ Validation error handling
- ✅ Consistent JSON error responses

### 2. **Authentication Service**
- ✅ User registration with role assignment
- ✅ User login with JWT generation
- ✅ Password encryption with BCrypt
- ✅ Duplicate username/email validation

### 3. **REST API Endpoints**
- ✅ POST `/api/auth/register` - Register new users
- ✅ POST `/api/auth/login` - Login and get JWT token

### 4. **Security Configuration**
- ✅ CORS enabled for frontend integration
- ✅ JWT token validation on protected endpoints
- ✅ Role-based access control ready

---

## 🚀 How to Run the Application

### Option 1: Using Maven (Recommended)
```bash
cd /home/thanhjash/JStore/main
mvn spring-boot:run
```

### Option 2: Using Java (after building)
```bash
cd /home/thanhjash/JStore/main
mvn clean package -DskipTests
java -jar target/main-0.0.1-SNAPSHOT.jar
```

### Expected Output
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::               (v3.5.7)

JStore : Started MainApplication in X.XXX seconds
```

If you see this, your application is running on **http://localhost:8080**!

---

## 🧪 Testing the API

### Tools You Can Use:
1. **Postman** - Desktop app for API testing
2. **curl** - Command line tool
3. **VS Code REST Client** - Extension for VS Code
4. **Insomnia** - API testing tool

---

## 📝 Test Cases

### Test 1: Register a New Customer

**Request:**
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "User registered successfully!"
}
```

**What happens:**
- User is created in the database
- Password is encrypted with BCrypt
- Default role `ROLE_CUSTOMER` is assigned

---

### Test 2: Register with Duplicate Username

**Request:**
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "different@example.com",
  "password": "password123"
}
```

**Expected Response (409 Conflict):**
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "User already exists with username: 'testuser'",
  "path": "/api/auth/register"
}
```

---

### Test 3: Register with Invalid Data

**Request:**
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "ab",
  "email": "invalid-email",
  "password": "123"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Input validation failed",
  "validationErrors": {
    "username": "Username must be between 3 and 50 characters",
    "email": "Email must be valid",
    "password": "Password must be between 6 and 120 characters"
  },
  "path": "/api/auth/register"
}
```

---

### Test 4: Login with Test User

**Request:**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTczNzAyMjIwMCwiZXhwIjoxNzM3MTA4NjAwfQ.abcd1234...",
  "type": "Bearer",
  "id": 3,
  "username": "testuser",
  "email": "testuser@example.com",
  "roles": ["ROLE_CUSTOMER"]
}
```

**What to do with the token:**
- Save the `token` value
- Use it in the `Authorization` header for protected endpoints
- Format: `Authorization: Bearer <token>`

---

### Test 5: Login with Database Seed User (Admin)

**Request:**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "admin",
  "email": "admin@jstore.com",
  "roles": ["ROLE_ADMIN"]
}
```

---

### Test 6: Login with Wrong Password

**Request:**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "wrongpassword"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid username or password",
  "path": "/api/auth/login"
}
```

---

### Test 7: Register an Admin User

**Request:**
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "newadmin",
  "email": "newadmin@example.com",
  "password": "admin123",
  "roles": ["admin"]
}
```

**Expected Response (200 OK):**
```json
{
  "message": "User registered successfully!"
}
```

Then login to verify:
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "newadmin",
  "password": "admin123"
}
```

**Response should show:**
```json
{
  "roles": ["ROLE_ADMIN"]
}
```

---

## 🔒 Testing Protected Endpoints (Coming Soon)

Once we implement other features, you'll use the JWT token like this:

**Example: Access cart (requires ROLE_CUSTOMER)**
```http
GET http://localhost:8080/api/cart
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example: Admin endpoint (requires ROLE_ADMIN)**
```http
POST http://localhost:8080/api/admin/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "New Product",
  "price": 99.99,
  "categoryId": 1
}
```

---

## 🐛 Common Issues and Solutions

### Issue 1: "Connection refused"
**Solution:** Make sure the application is running (`mvn spring-boot:run`)

### Issue 2: "Error: Role CUSTOMER not found in database"
**Solution:** Run the `seed.sql` script in Supabase to insert roles

### Issue 3: JWT token expired
**Solution:** Login again to get a new token (tokens expire after 24 hours)

### Issue 4: "Failed to determine a suitable driver class"
**Solution:** Check that `application.yml` has correct Supabase credentials

---

## 📊 Database Verification

After testing, you can verify users in Supabase SQL Editor:

### Check all users
```sql
SELECT u.id, u.username, u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
ORDER BY u.id;
```

### Check passwords are encrypted
```sql
SELECT username, password FROM users;
```
You should see BCrypt hashes (starting with `$2a$10$`)

---

## 🎯 What's Next?

Now that authentication is working, you can:

**Option B: Continue Building Core Features** ⭐
- Category management (Admin)
- Product & Inventory (Admin)
- Public product viewing
- Shopping cart
- Order checkout
- Reviews & ratings
- Voucher system
- Notifications

Would you like me to continue implementing all the remaining features?

---

## 📄 Quick Reference: cURL Commands

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Access protected endpoint (replace TOKEN with your actual JWT)
```bash
curl -X GET http://localhost:8080/api/cart \
  -H "Authorization: Bearer TOKEN"
```

---

Happy Testing! 🚀
