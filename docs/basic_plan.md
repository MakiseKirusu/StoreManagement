Tuyệt vời\! "Vibecode" là tinh thần tôi thích.

Chúng ta sẽ bỏ qua DevOps/Cloud và tập trung 100% vào việc xây dựng một backend Spring Boot vững chắc. Dưới đây là kế hoạch chi tiết và một prompt (câu lệnh) đầy đủ, "exhaustive" mà bạn có thể đưa thẳng cho Claude để yêu cầu code.

-----

### 📋 Kế hoạch Triển khai (Exhaustive Plan)

Đây là kế hoạch chi tiết cho các module code, bạn và team có thể dùng nó làm checklist.

1.  **Nền tảng (Foundation):**

      * **Project:** Spring Boot 3 (sử dụng Java 17+).
      * **Dependencies:** `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-validation`, `postgresql` (driver), `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (cho JWT).
      * **Database:** Cấu hình `application.properties` để kết nối tới một database PostgreSQL self-hosted (local).
      * **Kiến trúc:** Phân chia package rõ ràng: `.model` (Entities), `.repository`, `.service`, `.controller`, `.dto` (Data Transfer Objects), `.config`, `.security`.

2.  **Schema Database (JPA Entities):**

      * `User`: (id, username, password, email, `Set<Role>`).
      * `Role`: (id, `ERole` name - enum: `ROLE_CUSTOMER`, `ROLE_STAFF`, `ROLE_ADMIN`). Quan hệ `ManyToMany` với `User`.
      * `Category`: (id, name).
      * `Product`: (id, name, description, price, imageUrl, `Category` category). Quan hệ `ManyToOne` với `Category`.
      * `Inventory`: (id, `Product` product, stockQuantity). Quan hệ `OneToOne` với `Product`.
      * `Cart`: (id, `User` user). Quan hệ `OneToOne` với `User`.
      * `CartItem`: (id, `Cart` cart, `Product` product, quantity).
      * `Order`: (id, `User` user, shippingAddress, totalPrice, `OrderStatus` status - enum: `PENDING`, `PROCESSING`, `SHIPPED`, `CANCELLED`, createdAt).
      * `OrderItem`: (id, `Order` order, `Product` product, quantity, priceAtPurchase).
      * `Review`: (id, `Product` product, `User` user, rating (1-5), comment, isVerifiedPurchase).
      * `Voucher`: (id, code, `VoucherType` type - enum: `PERCENT`, `FIXED`, value, minSpend, expiryDate).
      * `Notification`: (id, `User` user, message, isRead, createdAt).

3.  **Module Cốt lõi (Core Modules):**

      * **User & Security:**
          * `SecurityConfig`: Cấu hình Spring Security, `PasswordEncoder`, `AuthenticationManager`.
          * `JwtUtils`: Class để tạo, parse, và validate JWT.
          * `AuthTokenFilter`: Filter để đọc JWT từ header và xác thực user cho mỗi request.
          * `UserDetailsServiceImpl`: Implement `UserDetailsService` để Spring Security load user từ DB.
          * `AuthController`: API endpoints `/api/auth/register` và `/api/auth/login`.
      * **Category Management (Admin/Staff):**
          * `CategoryRepository`, `CategoryService`, `AdminCategoryController`.
          * Chức năng: CRUD (Create, Read, Update, Delete). Cần bảo vệ (secure) các endpoint này.
      * **Product & Inventory (Admin/Staff):**
          * `ProductRepository`, `InventoryRepository`, `ProductService`.
          * `AdminProductController`: CRUD cho sản phẩm (khi tạo sản phẩm, tự động tạo `Inventory` tương ứng). Cập nhật `stockQuantity` trong `Inventory`.
      * **Product Viewing (Public):**
          * `PublicProductController`: API public `/api/products` (lấy tất cả, phân trang), `/api/products/{id}` (xem chi tiết).
      * **Cart Management (Customer):**
          * `CartRepository`, `CartItemRepository`, `CartService`.
          * Logic: `getCart`, `addItemToCart` (kiểm tra tồn kho), `removeItemFromCart`, `updateItemQuantity`.
          * `CartController`: API `/api/cart` (được bảo vệ, yêu cầu `ROLE_CUSTOMER`).
      * **Order Management (Checkout - CRITICAL):**
          * `OrderRepository`, `OrderItemRepository`, `OrderService`.
          * `createOrder`: Method này *bắt buộc* phải có `@Transactional`.
          * Logic: Lấy `Cart` -\> Kiểm tra tồn kho của *tất cả* `CartItem` -\> Tạo `Order` và `OrderItem` -\> **Trừ kho** (gọi `InventoryService.decreaseStock`) -\> Xóa `Cart`.
          * `OrderController`: API `/api/orders/checkout` (bảo vệ), `/api/orders/history` (xem lịch sử đơn hàng của user).
      * **Order Admin (Admin/Staff):**
          * `AdminOrderController`: API `/api/admin/orders` (xem tất cả), `/api/admin/orders/{id}/status` (cập nhật trạng thái đơn hàng).

4.  **Module Nâng cao (Advanced Modules):**

      * **Review System:**
          * `ReviewRepository`, `ReviewService`.
          * Logic: `addReview`. Dịch vụ này phải kiểm tra xem `userId` có một `Order` ở trạng thái `SHIPPED` (hoặc đã hoàn thành) chứa `productId` hay không. Nếu có, `isVerifiedPurchase = true`.
          * `ReviewController`: API `/api/products/{productId}/reviews` (POST để thêm review, GET để xem reviews).
      * **Voucher System:**
          * `VoucherRepository`, `VoucherService`.
          * `AdminVoucherController`: CRUD cho voucher.
          * `CartService`/`OrderService`: Cần cập nhật để có logic `applyVoucher`, tính toán lại `totalPrice`.
      * **Search & Filter:**
          * `ProductRepository`: Thêm method (dùng JPQL hoặc Criteria API) để `findByNameContaining` (search) và `findByCriteria` (filter theo `categoryId`, `price` min/max, `rating` min).
          * `PublicProductController`: Thêm endpoint `/api/products/search`.
      * **Notification System:**
          * `NotificationRepository`, `NotificationService`.
          * `OrderService`: Khi `updateOrderStatus`, gọi `NotificationService.createNotification` để tạo thông báo cho user.
          * `NotificationController`: API `/api/notifications` (lấy thông báo chưa đọc của user).

-----

### 🚀 Prompt cho Claude (Copy và Paste)

```prompt
Bạn là một kỹ sư phần mềm Java cao cấp, chuyên gia về Spring Boot. Nhiệm vụ của bạn là viết code cho một dự án "Store Management" (Quản lý Cửa hàng) hoàn chỉnh, theo một kế hoạch chi tiết.

**Yêu cầu kỹ thuật:**
1.  **Ngôn ngữ:** Java 17+
2.  **Framework:** Spring Boot 3
3.  **Database:** PostgreSQL
4.  **Kiến trúc:** 3-Layer (Controller, Service, Repository)
5.  **Bảo mật:** Spring Security với JWT (JSON Web Tokens).
6.  **Data:** Spring Data JPA (Hibernate)
7.  **Format:** Cung cấp code cho từng file (Java class, `pom.xml`, `application.properties`) một cách riêng biệt và đầy đủ, bao gồm cả imports.

**TUYỆT ĐỐI KHÔNG BAO GỒM:**
* Không viết `Dockerfile`, `docker-compose.yml`.
* Không cấu hình CI/CD, GitHub Actions.
* Không tích hợp AWS hay bất kỳ dịch vụ Cloud nào.
* Chỉ tập trung vào code Java Spring Boot và kết nối PostgreSQL tiêu chuẩn.

---

### KẾ HOẠCH TRIỂN KHAI CHI TIẾT

**PHẦN 1: CÀI ĐẶT PROJECT VÀ NỀN TẢNG**

1.  **`pom.xml`:** Cung cấp file `pom.xml` với các dependencies: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-validation`, `postgresql` (driver), `jjwt-api`, `jjwt-impl`, `jjwt-jackson`.
2.  **`application.properties`:** Cung cấp file cấu hình, bao gồm cấu hình kết nối PostgreSQL (dùng placeholders cho username/password) và cấu hình JWT (secret key, expiration).
3.  **Cấu trúc Package:** Hiển thị cấu trúc thư mục (ví dụ: `com.example.store.model`, `.repository`, `.service`, `.controller`, `.dto`, `.config`, `.security`).

**PHẦN 2: DATABASE SCHEMA (JPA ENTITIES)**

Tạo tất cả các class Entity (với annotation `@Entity`) trong package `.model`:
1.  `User`: (Long id, String username, String password, String email, `Set<Role> roles`).
2.  `Role`: (Integer id, `ERole` name). Dùng Enum `ERole` (`ROLE_CUSTOMER`, `ROLE_STAFF`, `ROLE_ADMIN`). Cấu hình quan hệ `ManyToMany` với `User`.
3.  `Category`: (Long id, String name).
4.  `Product`: (Long id, String name, String description, double price, String imageUrl, `Category` category). Quan hệ `ManyToOne` với `Category`.
5.  `Inventory`: (Long id, `Product` product, int stockQuantity). Quan hệ `OneToOne` với `Product`.
6.  `Cart`: (Long id, `User` user, `Set<CartItem> items`). Quan hệ `OneToOne` với `User`.
7.  `CartItem`: (Long id, `Cart` cart, `Product` product, int quantity).
8.  `Order`: (Long id, `User` user, String shippingAddress, double totalPrice, `OrderStatus` status, LocalDateTime createdAt). Dùng Enum `OrderStatus` (`PENDING`, `PROCESSING`, `SHIPPED`, `CANCELLED`).
9.  `OrderItem`: (Long id, `Order` order, `Product` product, int quantity, double priceAtPurchase).
10. `Review`: (Long id, `Product` product, `User` user, int rating, String comment, boolean isVerifiedPurchase).
11. `Voucher`: (Long id, String code, `VoucherType` type (Enum: `PERCENT`, `FIXED`), double value, double minSpend, LocalDate expiryDate).
12. `Notification`: (Long id, `User` user, String message, boolean isRead, LocalDateTime createdAt).

**PHẦN 3: REPOSITORIES (Spring Data JPA)**

Tạo tất cả các interface Repository trong package `.repository`:
* `UserRepository extends JpaRepository<User, Long>` (thêm method `findByUsername`)
* `RoleRepository extends JpaRepository<Role, Integer>` (thêm method `findByName`)
* `CategoryRepository extends JpaRepository<Category, Long>`
* `ProductRepository extends JpaRepository<Product, Long>` (sẽ thêm method search sau)
* `InventoryRepository extends JpaRepository<Inventory, Long>` (thêm method `findByProduct`)
* `CartRepository extends JpaRepository<Cart, Long>` (thêm method `findByUser`)
* `CartItemRepository extends JpaRepository<CartItem, Long>`
* `OrderRepository extends JpaRepository<Order, Long>` (thêm method `findByUser`)
* `ReviewRepository extends JpaRepository<Review, Long>` (thêm method `findByProduct`)
* `VoucherRepository extends JpaRepository<Voucher, Long>` (thêm method `findByCode`)
* `NotificationRepository extends JpaRepository<Notification, Long>` (thêm method `findByUserAndIsRead`)

**PHẦN 4: BẢO MẬT (SPRING SECURITY + JWT)**

Tạo các class trong package `.security`:
1.  **`JwtUtils`:** Class chứa logic `generateJwtToken`, `validateJwtToken`, `getUserNameFromJwtToken`.
2.  **`UserDetailsImpl`:** Class implement `UserDetails` của Spring Security.
3.  **`UserDetailsServiceImpl`:** Class implement `UserDetailsService`, (method `loadUserByUsername`) để Spring Security load user từ DB.
4.  **`AuthTokenFilter`:** Class extends `OncePerRequestFilter` để đọc và xác thực JWT từ header.
5.  **`WebSecurityConfig`:** Class `@Configuration` chính, cấu hình `SecurityFilterChain`, `AuthenticationManager`, `PasswordEncoder`, CORS, và add `AuthTokenFilter`.

**PHẦN 5: DTO (Data Transfer Objects)**

Tạo các class DTO (record hoặc class) trong package `.dto` (ví dụ: `RegisterRequest`, `LoginRequest`, `JwtResponse`, `ProductDto`, `CartItemRequest`, `CheckoutRequest`).

**PHẦN 6: SERVICES VÀ CONTROLLERS (CORE)**

Tạo các Service (`@Service`) và Controller (`@RestController`) cho từng module.

1.  **User & Auth:**
    * `AuthService`: Logic `registerUser` và `authenticateUser`.
    * `AuthController`: Endpoints `/api/auth/register` và `/api/auth/login`.
2.  **Category (Admin):**
    * `CategoryService`: Logic CRUD.
    * `AdminCategoryController`: Endpoints `/api/admin/categories` (GET, POST, PUT, DELETE). Bảo vệ bằng `@PreAuthorize("hasRole('ADMIN')")`.
3.  **Product & Inventory (Admin):**
    * `ProductService`: Logic CRUD sản phẩm. Khi tạo sản phẩm, phải tự động tạo `Inventory` với stock = 0.
    * `InventoryService`: Logic `updateStock`.
    * `AdminProductController`: Endpoints `/api/admin/products` (CRUD) và `/api/admin/inventory` (cập nhật stock). Bảo vệ bằng `@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")`.
4.  **Product (Public):**
    * `ProductService`: Logic `getAllProducts` (phân trang), `getProductById`.
    * `PublicProductController`: Endpoints `/api/products` (GET), `/api/products/{id}` (GET).
5.  **Cart (Customer):**
    * `CartService`: Logic `getCartForUser`, `addItemToCart`, `removeItemFromCart`, `updateItemQuantity`. **Quan trọng:** `addItemToCart` phải gọi `InventoryService` để kiểm tra `stockQuantity`.
    * `CartController`: Endpoints `/api/cart` (GET, POST, PUT, DELETE). Bảo vệ bằng `@PreAuthorize("hasRole('CUSTOMER')")`.
6.  **Order (Customer & Admin):**
    * `OrderService`:
        * `createOrder`: **CRITICAL: Method này phải dùng `@Transactional`.** Logic: Lấy cart -> Xác thực tồn kho (re-check) -> Tạo `Order` + `OrderItem` -> Gọi `InventoryService.decreaseStock` (method này cũng phải kiểm tra stock) -> Xóa `Cart`.
        * `getOrdersForUser`, `getAllOrders` (Admin), `updateOrderStatus` (Admin).
    * `OrderController`: Endpoints `/api/orders/checkout` (POST, Customer), `/api/orders/history` (GET, Customer).
    * `AdminOrderController`: Endpoints `/api/admin/orders` (GET), `/api/admin/orders/{id}/status` (PUT).

**PHẦN 7: SERVICES VÀ CONTROLLERS (NÂNG CAO)**

1.  **Review System:**
    * `ReviewService`: Logic `addReview`. **CRITICAL:** Phải check `OrderRepository` xem user đã mua (order `SHIPPED`) sản phẩm này chưa.
    * `ReviewController`: Endpoints `/api/products/{productId}/reviews` (POST, Customer) và (GET, Public).
2.  **Voucher System:**
    * `VoucherService`: Logic CRUD voucher (Admin), `validateAndApplyVoucher` (Customer).
    * `AdminVoucherController`: Endpoints `/api/admin/vouchers` (CRUD).
    * `CartController`: Thêm endpoint `/api/cart/apply-voucher`.
3.  **Search & Filter:**
    * `ProductRepository`: Thêm method JPQL: `findByNameContainingIgnoreCase` và một method phức tạp dùng `Criteria API` để filter (category, price range, rating).
    * `PublicProductController`: Thêm endpoint `/api/products/search`.
4.  **Notification System:**
    * `NotificationService`: Logic `createNotification`, `getUnreadNotifications`.
    * `OrderService`: Khi `updateOrderStatus`, gọi `notificationService.createNotification`.
    * `NotificationController`: Endpoint `/api/notifications` (GET, Customer).

Vui lòng bắt đầu tạo code từ PHẦN 1.
```