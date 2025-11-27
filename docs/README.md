# JStore Documentation Index

Complete documentation for the JStore E-Commerce Platform.

---

## 📚 Quick Start Guides

### For Developers

1. **[Configuration Guide](CONFIGURATION_GUIDE.md)** - Database, Supabase, and environment setup
2. **[Admin Setup](ADMIN_SETUP.md)** - Creating and managing admin accounts ⚠️ **Important!**
3. **[Testing Auth](TESTING_AUTH.md)** - Authentication and authorization testing

### For Testers

1. **[Media Upload Test Report](MEDIA_UPLOAD_TEST_REPORT.md)** - Latest test results for image/video uploads
2. **[Final Test Report (Clean)](FINAL_TEST_REPORT_CLEAN.md)** - Comprehensive system test results

---

## 📋 Project Documentation

### Planning & Architecture

- **[Overview](overview.md)** - High-level system architecture and design
- **[Basic Plan](basic_plan.md)** - Initial project planning and requirements
- **[Implementation Status](IMPLEMENTATION_STATUS.md)** - Current feature implementation status

### Development Guides

- **[Backend Fixes Summary](BACKEND_FIXES_SUMMARY.md)** - History of backend bug fixes
- **[Frontend Setup Complete](FRONTEND_SETUP_COMPLETE.md)** - Frontend installation and configuration

---

## 🧪 Testing Resources

### Test Scripts

All test scripts are located in `scripts/`:

- **[complete_backend_test.sh](scripts/complete_backend_test.sh)** - Comprehensive backend API tests
- **[test_fresh_account.sh](scripts/test_fresh_account.sh)** - Tests with new user account
- **[test_cancel_order.sh](scripts/test_cancel_order.sh)** - Order cancellation workflow tests

### Test Results

- **[Complete Test Results](complete_test_results.md)** - Summary of all test executions

---

## 🗄️ Database Resources

### SQL Scripts

Important SQL scripts for admin setup:

- **create_admin.sql** - Create new admin user
- **fix_admin_password.sql** - Reset admin password
- **grant_admin_role.sql** - Grant admin role to existing user

**📖 See [Admin Setup Guide](ADMIN_SETUP.md) for detailed usage instructions.**

---

## 🎯 Feature-Specific Documentation

### Phase 1: Core E-Commerce ✅
- User authentication (JWT)
- Product catalog with categories
- Shopping cart management
- Order processing
- Inventory tracking

### Phase 2: Media Upload System ✅
- **Documentation**: [Media Upload Test Report](MEDIA_UPLOAD_TEST_REPORT.md)
- Image upload (JPG, PNG, WebP, GIF)
- Video upload (MP4, WebM)
- Supabase Storage integration
- Multiple media per product
- Gallery carousel on product pages

### Phase 3: Review System ✅
- Customer product reviews
- Star ratings (1-5)
- Verified purchase badges
- Review moderation

---

## 🚀 Quick Reference

### Default Admin Credentials

```
Username: jstore_admin
Password: Admin12345
```

**⚠️ Change these in production!**

### Default URLs

- Backend API: http://localhost:8080
- Frontend UI: http://localhost:5173
- API Documentation: http://localhost:8080/swagger-ui.html

### Environment Variables

See [Configuration Guide](CONFIGURATION_GUIDE.md) for complete list.

---

## 📊 Test Accounts

For testing purposes, use these accounts:

### Admin Account
```
Username: jstore_admin
Password: Admin12345
Roles: ROLE_ADMIN
```

### Customer Account
```
Username: customer1
Password: password123
Roles: ROLE_CUSTOMER
```

---

## 🔧 Development Workflow

### Running the Application

1. **Start Backend**:
   ```bash
   cd main
   ./mvnw spring-boot:run
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Run Tests**:
   ```bash
   cd docs/scripts
   ./complete_backend_test.sh
   ```

### Testing Checklist

- [ ] Authentication (login/register)
- [ ] Product browsing
- [ ] Shopping cart operations
- [ ] Order placement
- [ ] Media upload (images/videos)
- [ ] Review submission
- [ ] Admin operations

---

## 📝 Documentation Standards

### File Naming Conventions

- `UPPERCASE_WITH_UNDERSCORES.md` - Major documentation files
- `lowercase_with_underscores.md` - Supporting documentation
- `*.sh` - Test scripts (in scripts/)
- `*.sql` - Database scripts

### Documentation Updates

When adding new features:
1. Update relevant documentation file
2. Add entry to this index (README.md)
3. Include test results if applicable
4. Update main project README.md

---

## 🐛 Known Issues & Fixes

See [Backend Fixes Summary](BACKEND_FIXES_SUMMARY.md) for complete history.

### Recent Fixes (November 2025)

1. ✅ **Media Upload Button Form Submission** - Fixed buttons triggering parent form submit
2. ✅ **Props Mismatch in Upload Components** - Corrected component prop passing
3. ✅ **MIME Type Detection** - Fixed video upload MIME type validation
4. ✅ **Product Edit Inventory Field** - Fixed field name mismatch (quantity vs stockQuantity)
5. ✅ **Order Cancellation Bug** - Fixed NullPointerException with JOIN FETCH query

---

## 📞 Getting Help

1. Check the relevant documentation file
2. Review test reports for examples
3. Check the main [README.md](../README.md) for setup instructions
4. Review commit history for recent changes

---

**Last Updated**: November 26, 2025
**Project Version**: 1.0.0
**Status**: Active Development
