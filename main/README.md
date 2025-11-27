# JStore - E-Commerce Backend API

A complete, production-ready e-commerce backend built with Spring Boot 3.5.7, Java 21, and Supabase PostgreSQL.

## Features

- 🔐 JWT Authentication & Authorization
- 🛒 Shopping Cart Management
- 📦 Order Processing with Transaction Support
- ⭐ Review System with Purchase Verification
- 🎫 Voucher/Discount System
- 🔔 Notification System
- 👨‍💼 Admin Management Tools
- 🔍 Product Search & Filtering

## Quick Start

### Prerequisites
- Java 21
- Maven 3.6+
- Supabase PostgreSQL database

### Database Setup
1. Create a Supabase project
2. Run the SQL scripts in `database/supabase/`:
   ```bash
   # Execute schema.sql first
   # Then execute seed.sql for test data
   ```

### Configuration
Update `src/main/resources/application.yml` with your Supabase credentials:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://your-host:5432/postgres
    username: your-username
    password: your-password
```

### Run the Application
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Public Endpoints (No Auth Required)
```
GET    /api/public/products           # Browse products
GET    /api/public/products/{id}      # Product details
GET    /api/public/categories         # List categories
POST   /api/auth/register             # User registration
POST   /api/auth/login                # User login
```

### Customer Endpoints (CUSTOMER Role)
```
POST   /api/cart/items                # Add to cart
GET    /api/cart                      # View cart
PUT    /api/cart/items/{productId}    # Update cart item
DELETE /api/cart/items/{productId}    # Remove from cart
POST   /api/orders/checkout           # Create order
GET    /api/orders                    # Order history
POST   /api/reviews                   # Create review
```

### Admin Endpoints (ADMIN Role)
```
POST   /api/admin/products            # Create product
PUT    /api/admin/products/{id}       # Update product
DELETE /api/admin/products/{id}       # Delete product
GET    /api/admin/orders              # View all orders
PUT    /api/admin/orders/{id}/status  # Update order status
POST   /api/admin/vouchers            # Create voucher
```

## Testing

### Test the Cart Flow
```bash
# Run the test script
./test_cart_final.sh

# Or test manually:
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:8080/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

**Expected Result**: Cart returns with items and calculated total

### Test Results ✅
- Authentication: Working
- Product Browsing: Working
- Cart Operations: **Working** (add, update, view, calculate total)
- Cart Persistence: **Working** (items properly saved to database)

## Architecture

### Tech Stack
- **Framework**: Spring Boot 3.5.7
- **Language**: Java 21
- **Database**: Supabase PostgreSQL (Direct Connection)
- **ORM**: Hibernate 6.6.33
- **Security**: Spring Security 6 + JWT
- **Build**: Maven

### Project Structure
```
src/main/java/com/store/main/
├── config/          # Configuration classes
├── controller/      # REST API endpoints
│   └── admin/       # Admin-only endpoints
├── dto/             # Data Transfer Objects
├── exception/       # Exception handling
├── model/           # JPA entities
├── repository/      # Data access layer
├── security/        # Security & JWT
└── service/         # Business logic
```

### Database Schema
12 tables with proper relationships:
- users, roles, user_roles
- categories, products, inventory
- carts, cart_items
- orders, order_items
- reviews, vouchers, notifications

## Documentation

- **Implementation Summary**: See `/docs/IMPLEMENTATION_SUMMARY.md`
- **Troubleshooting Guide**: See `/docs/TROUBLESHOOTING.md`
- **Database Schema**: See `/database/supabase/schema.sql`

## Key Technical Decisions

### 1. Database Connection Mode
**Using Supabase Direct Connection (Port 5432)** instead of Transaction Pooler (6543)

**Why?**
- Hibernate requires stateful session management
- Transaction Pooler is stateless and cuts transactions
- Direct Connection supports full Hibernate functionality

See `/docs/TROUBLESHOOTING.md` for detailed analysis.

### 2. Bidirectional Relationships
Properly maintaining both sides of JPA relationships:
```java
// Both sides must be maintained
child.setParent(parent);
parent.getChildren().add(child);
parentRepository.save(parent); // Cascade saves child
```

### 3. JSON Serialization
Using `@JsonIgnoreProperties` to break circular references:
```java
@Entity
@JsonIgnoreProperties({"cart"})  // Prevents infinite recursion
public class CartItem {
    @ManyToOne
    private Cart cart;
}
```

### 4. DTO Pattern
Public APIs return DTOs instead of entities to avoid:
- Lazy-loading exceptions
- Exposing internal structure
- N+1 query problems

## Critical Fixes Applied

1. ✅ **Database Configuration**: Switched to Direct Connection (port 5432)
2. ✅ **Bidirectional Relationships**: Proper collection management
3. ✅ **Lombok Configuration**: Exclude relationships from toString/hashCode
4. ✅ **Jackson Configuration**: Hibernate6Module + JavaTimeModule
5. ✅ **BigDecimal**: Use for all monetary values

## Development Notes

### Adding a New Feature
1. Create entity in `/model`
2. Create repository in `/repository`
3. Implement service in `/service`
4. Create controller in `/controller`
5. Add DTOs in `/dto` if needed
6. Update database schema in `/database/supabase/schema.sql`

### Common Patterns
```java
// Service with transactions
@Service
@RequiredArgsConstructor
@Transactional
public class MyService {
    private final MyRepository repository;

    public MyEntity doSomething() {
        // Business logic
    }
}

// Controller with auth
@RestController
@RequestMapping("/api/my-endpoint")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class MyController {
    private final MyService service;

    @GetMapping
    public ResponseEntity<MyEntity> get() {
        return ResponseEntity.ok(service.doSomething());
    }
}
```

## Troubleshooting

### Cart Items Not Appearing?
- ✅ **Fixed!** Updated to Direct Connection (port 5432)
- ✅ **Fixed!** Proper bidirectional relationship management
- See `/docs/TROUBLESHOOTING.md` for details

### JSON Serialization Errors?
- ✅ **Fixed!** Added `@JsonIgnoreProperties` to entities
- ✅ **Fixed!** Configured Hibernate6Module in Jackson

### Transaction Rollback Issues?
- Ensure using `@Transactional(rollbackFor = Exception.class)`
- Use Direct Connection (port 5432), not Transaction Pooler
- Validate all operations within transaction boundary

## Production Checklist

Before deploying to production:

- [ ] Change JWT secret to secure, randomly generated value
- [ ] Enable HTTPS/TLS
- [ ] Set up proper logging (e.g., ELK stack)
- [ ] Configure connection pool size based on load
- [ ] Add rate limiting
- [ ] Set up monitoring and alerts
- [ ] Review and harden security settings
- [ ] Enable CORS with specific origins only
- [ ] Set up backup strategy for database
- [ ] Configure proper error messages (no stack traces)

## License

This project is for educational purposes.

## Support

For issues and questions:
1. Check `/docs/TROUBLESHOOTING.md`
2. Review `/docs/IMPLEMENTATION_SUMMARY.md`
3. Examine test scripts in `/tmp/test_*.sh`

---

**Version**: 1.0
**Status**: Core features complete, tested, and working
**Last Updated**: 2025-01-13
