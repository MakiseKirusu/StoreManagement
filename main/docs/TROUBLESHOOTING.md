# JStore Troubleshooting Report

## Overview
This document details all critical issues encountered during the JStore development and their solutions. These issues primarily related to Hibernate session management, Supabase connection pooling, and entity serialization.

---

## Critical Issues and Solutions

### 1. Cart Items Not Persisting (Primary Issue)

#### Problem
Cart items were being saved to the database (INSERT statements visible in logs), but when querying the cart, the items array was always empty.

#### Root Causes Identified

**A. Supabase Transaction Pooler Incompatibility**
- **Issue**: Using Supabase Transaction Pooler (port 6543) with Hibernate
- **Why it failed**: Transaction Pooler is stateless and designed for short-lived connections. Hibernate requires stateful, long-lived sessions to manage entity state and relationships.
- **Symptom**: Database writes succeeded, but subsequent reads within the same transaction showed empty collections

**B. Bidirectional Relationship Not Maintained**
- **Issue**: Only setting one side of the Cart ↔ CartItem relationship
- **Code**: `cartItemRepository.save(cartItem)` without adding to `cart.getItems()`
- **Why it failed**: Hibernate relies on in-memory object graph for managing relationships within a session

**C. Lombok-Induced StackOverflowError**
- **Issue**: Using `@Data` annotation on entities with bidirectional relationships
- **Why it failed**: Generated `toString()` and `hashCode()` methods caused infinite recursion between Cart and CartItem

**D. Jackson JSON Serialization Infinite Loop**
- **Issue**: Cart → CartItem → Cart circular reference during JSON serialization
- **Why it failed**: Jackson's default serializer followed bidirectional references indefinitely

#### Solutions Applied

**Solution 1: Database Configuration**
```yaml
# File: src/main/resources/application.yml
spring:
  datasource:
    # BEFORE (WRONG):
    url: jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?prepareThreshold=0

    # AFTER (CORRECT):
    url: jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
```

**Key Changes:**
- Changed port from `6543` (Transaction Pooler) to `5432` (Direct Connection/Session Mode)
- Removed `prepareThreshold=0` workaround
- Added Hibernate batch optimization for better performance

**Solution 2: Proper Bidirectional Relationship Management**
```java
// File: src/main/java/com/store/main/service/CartService.java

// BEFORE (WRONG):
CartItem cartItem = new CartItem();
cartItem.setCart(cart);
cartItem.setProduct(product);
cartItem.setQuantity(request.getQuantity());
cartItemRepository.save(cartItem);
// Missing: cart.getItems().add(cartItem)

// AFTER (CORRECT):
CartItem cartItem = new CartItem();
cartItem.setCart(cart);
cartItem.setProduct(product);
cartItem.setQuantity(request.getQuantity());

// Add to cart's collection (maintain bidirectional relationship)
cart.getItems().add(cartItem);

// Save through cart (cascade will handle cart item)
cartRepository.save(cart);
```

**Solution 3: Fix Lombok Configuration**
```java
// File: src/main/java/com/store/main/model/Cart.java

// BEFORE (WRONG):
@Data
public class Cart {
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL)
    private Set<CartItem> items = new HashSet<>();
}

// AFTER (CORRECT):
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"user", "items"})
@EqualsAndHashCode(exclude = {"user", "items"})
public class Cart {
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL)
    private Set<CartItem> items = new HashSet<>();
}
```

**Solution 4: Break Jackson JSON Serialization Cycle**
```java
// File: src/main/java/com/store/main/model/CartItem.java

@Entity
@JsonIgnoreProperties({"cart"})  // Prevent infinite recursion
public class CartItem {
    @ManyToOne(fetch = FetchType.LAZY)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    private Product product;

    private Integer quantity;
}
```

---

### 2. Hibernate Lazy-Loading JSON Serialization Error

#### Problem
```
Type definition error: [simple type, class org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor]
```

#### Root Cause
Jackson cannot serialize Hibernate lazy-loaded proxy objects directly.

#### Solutions Applied

**Solution 1: Add Jackson Hibernate Module**
```xml
<!-- File: pom.xml -->
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-hibernate6</artifactId>
</dependency>
```

**Solution 2: Configure Jackson**
```java
// File: src/main/java/com/store/main/config/JacksonConfig.java

@Configuration
public class JacksonConfig {
    @Bean
    public ObjectMapper objectMapper() {
        Hibernate6Module hibernate6Module = new Hibernate6Module();
        hibernate6Module.configure(Hibernate6Module.Feature.FORCE_LAZY_LOADING, false);
        hibernate6Module.configure(Hibernate6Module.Feature.SERIALIZE_IDENTIFIER_FOR_LAZY_NOT_LOADED_OBJECTS, true);

        return Jackson2ObjectMapperBuilder.json()
                .modules(hibernate6Module, new JavaTimeModule())
                .build();
    }
}
```

**Solution 3: Use DTOs for Public APIs**
```java
// File: src/main/java/com/store/main/dto/response/ProductResponse.java

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;

    public static ProductResponse fromProduct(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setImageUrl(product.getImageUrl());

        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }
        return response;
    }
}
```

---

### 3. PostgreSQL Prepared Statement Error

#### Problem
```
ERROR: prepared statement "S_1" already exists
```

#### Root Cause
Supabase Transaction Pooler doesn't properly support prepared statements due to connection multiplexing.

#### Solution
This was resolved by switching to Direct Connection (port 5432). The temporary workaround `prepareThreshold=0` is no longer needed.

---

### 4. BigDecimal Type Mismatches

#### Problem
Schema validation errors: Database has NUMERIC but entities used Double/Float.

#### Solution
Changed all monetary fields to BigDecimal:
```java
// BEFORE:
private Double price;

// AFTER:
private BigDecimal price;
```

**Files Updated:**
- `Product.java` (price)
- `OrderItem.java` (priceAtPurchase)
- `Order.java` (totalPrice)
- `Voucher.java` (value, minSpend)
- `ProductRequest.java` (price)

---

### 5. LocalDateTime Serialization Error

#### Problem
```
Java 8 date/time type LocalDateTime not supported by default
```

#### Solution
Added JavaTimeModule to Jackson configuration:
```java
return Jackson2ObjectMapperBuilder.json()
        .modules(hibernate6Module, new JavaTimeModule())
        .build();
```

---

## Testing Verification

### Cart Functionality Test Results
```bash
# Test Script: /tmp/test_cart_final.sh

1. User Registration: ✅ SUCCESS
2. User Login: ✅ SUCCESS
3. Add iPhone (qty 2): ✅ SUCCESS - Cart shows item
4. Add Samsung (qty 1): ✅ SUCCESS - Cart shows 2 items
5. View Cart: ✅ SUCCESS - Total: $2899.97
```

### Working Endpoints
- `POST /api/auth/register` ✅
- `POST /api/auth/login` ✅
- `GET /api/public/categories` ✅
- `GET /api/public/products` ✅
- `POST /api/cart/items` ✅
- `GET /api/cart` ✅
- `PUT /api/cart/items/{productId}` ✅
- `DELETE /api/cart/items/{productId}` ✅

---

## Key Lessons Learned

### 1. Supabase Connection Modes
- **Transaction Pooler (6543)**: Use for serverless functions, stateless operations
- **Session Mode (5432)**: Use for Hibernate, long-running applications requiring stateful sessions

### 2. Hibernate Bidirectional Relationships
Always maintain both sides of the relationship:
```java
// Set parent reference
child.setParent(parent);

// Add to parent's collection
parent.getChildren().add(child);

// Save through parent (with cascade)
parentRepository.save(parent);
```

### 3. Lombok with JPA Entities
- Avoid `@Data` on entities with relationships
- Use `@Getter`, `@Setter` individually
- Always exclude relationships from `@ToString` and `@EqualsAndHashCode`

### 4. Jackson Serialization
- Use `@JsonIgnoreProperties` to break circular references
- Consider DTOs for complex entity graphs
- Configure Hibernate6Module for lazy-loading support

---

## Configuration Summary

### Application Properties
```yaml
spring:
  datasource:
    url: jdbc:postgresql://host:5432/postgres  # Port 5432, not 6543

  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
```

### Entity Annotations Best Practices
```java
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"relationships"})
@EqualsAndHashCode(exclude = {"relationships"})
@JsonIgnoreProperties({"parent"})  // For child entities
public class ChildEntity {
    @ManyToOne
    private ParentEntity parent;
}
```

---

## Future Recommendations

1. **Consider DTO Layer**: Implement a complete DTO layer for all API responses to avoid entity serialization issues

2. **Connection Pool Monitoring**: Add monitoring for connection pool metrics in production

3. **Transaction Management**: Review all `@Transactional` boundaries to ensure optimal performance

4. **Lazy Loading Strategy**: Consider fetch joins or DTOs for frequently accessed relationships to avoid N+1 queries

5. **Testing**: Add integration tests for cart operations with actual database transactions

---

## References

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool)
- [Hibernate Bidirectional Associations](https://docs.jboss.org/hibernate/orm/6.0/userguide/html_single/Hibernate_User_Guide.html#associations)
- [Jackson Hibernate Module](https://github.com/FasterXML/jackson-datatype-hibernate)
- [Lombok Best Practices with JPA](https://www.baeldung.com/lombok-jpa)

---

**Document Version**: 1.0
**Last Updated**: 2025-01-13
**Status**: All issues resolved, cart functionality working
