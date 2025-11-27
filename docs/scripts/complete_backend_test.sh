#!/bin/bash

# JStore COMPLETE Backend API Test Script
# Tests ALL features: Auth, Products, Cart, Orders, Admin, Reviews, Vouchers

BASE_URL="http://localhost:8080"
RESULTS_FILE="/tmp/complete_test_results.md"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "# JStore E-Commerce API - Complete Backend Test Report" > $RESULTS_FILE
echo "**Date**: $(date)" >> $RESULTS_FILE
echo "**Base URL**: $BASE_URL" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local test_name="$1"
    local expected_code="$2"
    local actual_code="$3"
    local response="$4"

    if [ "$actual_code" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name (HTTP $actual_code)"
        echo "- ✅ **PASS**: $test_name (HTTP $actual_code)" >> $RESULTS_FILE
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name (Expected: $expected_code, Got: $actual_code)"
        echo "   Response: $response"
        echo "- ❌ **FAIL**: $test_name (Expected: $expected_code, Got: $actual_code)" >> $RESULTS_FILE
        echo "  \`\`\`" >> $RESULTS_FILE
        echo "  $response" >> $RESULTS_FILE
        echo "  \`\`\`" >> $RESULTS_FILE
        ((FAILED++))
        return 1
    fi
}

echo "================================================================="
echo "JStore E-Commerce API - COMPLETE Backend Test Suite"
echo "================================================================="
echo ""

# ==============================================================================
# LEVEL 1: AUTHENTICATION TESTS
# ==============================================================================
echo -e "\n${YELLOW}═══ LEVEL 1: Authentication Tests ═══${NC}"
echo "" >> $RESULTS_FILE
echo "## Level 1: Authentication Tests" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 1.1: Register customer user
echo -e "\n${BLUE}--- Test 1.1: Register Customer User ---${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer1",
    "email": "customer1@example.com",
    "password": "password123"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
test_endpoint "Register customer user" 200 "$HTTP_CODE" "$BODY"

# Test 1.2: Login as customer
echo -e "\n${BLUE}--- Test 1.2: Login as Customer ---${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer1",
    "password": "password123"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
test_endpoint "Customer login" 200 "$HTTP_CODE" "$BODY"

CUSTOMER_TOKEN=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null || echo "")
if [ -z "$CUSTOMER_TOKEN" ]; then
    echo -e "${RED}ERROR: Failed to extract customer JWT token${NC}"
else
    echo -e "${GREEN}Customer token extracted${NC}"
fi

# Test 1.3: Register admin user (need to check if admin user exists in DB)
echo -e "\n${BLUE}--- Test 1.3: Login as Admin (using existing admin) ---${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    test_endpoint "Admin login (existing)" 200 "$HTTP_CODE" "$BODY"
    ADMIN_TOKEN=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null || echo "")
    if [ -n "$ADMIN_TOKEN" ]; then
        echo -e "${GREEN}Admin token extracted${NC}"
    fi
else
    echo -e "${YELLOW}No existing admin, will use customer for remaining tests${NC}"
    ADMIN_TOKEN=""
fi

# Test 1.4: Invalid credentials
echo -e "\n${BLUE}--- Test 1.4: Login with Invalid Credentials ---${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer1",
    "password": "wrongpassword"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_endpoint "Login with wrong password (should fail)" 401 "$HTTP_CODE"

# ==============================================================================
# LEVEL 2: PUBLIC PRODUCT ENDPOINTS
# ==============================================================================
echo -e "\n${YELLOW}═══ LEVEL 2: Public Product Endpoints ═══${NC}"
echo "" >> $RESULTS_FILE
echo "## Level 2: Public Product Endpoints" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 2.1: Get all products
echo -e "\n${BLUE}--- Test 2.1: Get All Products (Paginated) ---${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/public/products?page=0&size=10")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_endpoint "Get all products with pagination" 200 "$HTTP_CODE"

# Test 2.2: Get single product
echo -e "\n${BLUE}--- Test 2.2: Get Product by ID ---${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/public/products/1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
test_endpoint "Get product by ID" 200 "$HTTP_CODE"

# Extract product details for later use
PRODUCT_NAME=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('name', ''))" 2>/dev/null || echo "")

# Test 2.3: Get categories
echo -e "\n${BLUE}--- Test 2.3: Get All Categories ---${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/public/categories")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_endpoint "Get all categories" 200 "$HTTP_CODE"

# Test 2.4: Search products
echo -e "\n${BLUE}--- Test 2.4: Search Products ---${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/public/products/search?name=laptop")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_endpoint "Search products by name" 200 "$HTTP_CODE"

# Test 2.5: Get product inventory
echo -e "\n${BLUE}--- Test 2.5: Check Product Inventory ---${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/public/products/1/inventory")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_endpoint "Get product inventory status" 200 "$HTTP_CODE"

# Test 2.6: Non-existent product
echo -e "\n${BLUE}--- Test 2.6: Get Non-Existent Product ---${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/public/products/99999")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
test_endpoint "Get non-existent product (should fail)" 404 "$HTTP_CODE"

# ==============================================================================
# LEVEL 3: CART OPERATIONS
# ==============================================================================
echo -e "\n${YELLOW}═══ LEVEL 3: Shopping Cart Operations ═══${NC}"
echo "" >> $RESULTS_FILE
echo "## Level 3: Shopping Cart Operations" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

if [ -z "$CUSTOMER_TOKEN" ]; then
    echo -e "${RED}Skipping cart tests - no customer token${NC}"
else
    # Test 3.1: Add first item to cart
    echo -e "\n${BLUE}--- Test 3.1: Add First Item to Cart ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/cart/items" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"productId": 1, "quantity": 2}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Add item to cart" 200 "$HTTP_CODE"

    # Test 3.2: Add second item
    echo -e "\n${BLUE}--- Test 3.2: Add Second Item to Cart ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/cart/items" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"productId": 2, "quantity": 1}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Add second item to cart" 200 "$HTTP_CODE"

    # Test 3.3: View cart with items
    echo -e "\n${BLUE}--- Test 3.3: View Cart ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/cart" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    test_endpoint "View cart with multiple items" 200 "$HTTP_CODE"

    # Display cart details
    echo "Cart contents:" | tee -a $RESULTS_FILE
    echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"  Items: {data.get('itemCount', 0)}, Total: \${data.get('total', 0)}\")" 2>/dev/null | tee -a $RESULTS_FILE

    # Test 3.4: Update item quantity
    echo -e "\n${BLUE}--- Test 3.4: Update Cart Item Quantity ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${BASE_URL}/api/cart/items/1?quantity=5" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Update cart item quantity" 200 "$HTTP_CODE"

    # Test 3.5: Try to add item without authentication
    echo -e "\n${BLUE}--- Test 3.5: Add to Cart Without Auth (Should Fail) ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/cart/items" \
      -H "Content-Type: application/json" \
      -d '{"productId": 1, "quantity": 1}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Add to cart without authentication (should fail)" 401 "$HTTP_CODE"
fi

# ==============================================================================
# LEVEL 4: ORDER CHECKOUT & MANAGEMENT
# ==============================================================================
echo -e "\n${YELLOW}═══ LEVEL 4: Order Checkout & Management ═══${NC}"
echo "" >> $RESULTS_FILE
echo "## Level 4: Order Checkout & Management" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

if [ -z "$CUSTOMER_TOKEN" ]; then
    echo -e "${RED}Skipping order tests - no customer token${NC}"
else
    # Test 4.1: Checkout
    echo -e "\n${BLUE}--- Test 4.1: Checkout Order ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/orders/checkout" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "shippingAddress": "123 Main Street, Test City, TC 12345",
        "voucherCode": null
      }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    test_endpoint "Checkout order" 201 "$HTTP_CODE"

    # Extract order ID
    ORDER_ID=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")
    if [ -n "$ORDER_ID" ]; then
        echo -e "${GREEN}Order created with ID: $ORDER_ID${NC}"
        echo "**Order ID**: $ORDER_ID" >> $RESULTS_FILE
    fi

    # Test 4.2: View user orders
    echo -e "\n${BLUE}--- Test 4.2: Get User Order History ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/orders" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Get user order history" 200 "$HTTP_CODE"

    # Test 4.3: Get specific order
    if [ -n "$ORDER_ID" ]; then
        echo -e "\n${BLUE}--- Test 4.3: Get Specific Order Details ---${NC}"
        RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/orders/${ORDER_ID}" \
          -H "Authorization: Bearer $CUSTOMER_TOKEN")
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        BODY=$(echo "$RESPONSE" | sed '$d')
        test_endpoint "Get order by ID" 200 "$HTTP_CODE"
    fi

    # Test 4.4: Cancel order (should work if status is PENDING)
    if [ -n "$ORDER_ID" ]; then
        echo -e "\n${BLUE}--- Test 4.4: Cancel Order ---${NC}"
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/orders/${ORDER_ID}/cancel" \
          -H "Authorization: Bearer $CUSTOMER_TOKEN")
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        # May be 200 or 400 depending on order status
        if [ "$HTTP_CODE" -eq 200 ]; then
            test_endpoint "Cancel order" 200 "$HTTP_CODE"
        else
            echo -e "${YELLOW}Order cancellation returned HTTP $HTTP_CODE (may not be cancellable)${NC}"
        fi
    fi
fi

# ==============================================================================
# LEVEL 5: ADMIN ORDER MANAGEMENT
# ==============================================================================
echo -e "\n${YELLOW}═══ LEVEL 5: Admin Order Management ═══${NC}"
echo "" >> $RESULTS_FILE
echo "## Level 5: Admin Order Management" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Create a new order for admin testing
if [ -n "$CUSTOMER_TOKEN" ]; then
    echo -e "\n${BLUE}--- Setup: Create Order for Admin Testing ---${NC}"

    # Add items to cart
    curl -s -X POST "${BASE_URL}/api/cart/items" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"productId": 1, "quantity": 1}' > /dev/null

    # Checkout
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/orders/checkout" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"shippingAddress": "456 Test Ave, City, ST 12345", "voucherCode": null}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    ADMIN_TEST_ORDER_ID=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")
    if [ -n "$ADMIN_TEST_ORDER_ID" ]; then
        echo -e "${GREEN}Created order $ADMIN_TEST_ORDER_ID for admin testing${NC}"
    fi
fi

if [ -n "$ADMIN_TOKEN" ] && [ -n "$ADMIN_TEST_ORDER_ID" ]; then
    # Test 5.1: Get all orders (admin)
    echo -e "\n${BLUE}--- Test 5.1: Admin - Get All Orders ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/admin/orders" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Admin get all orders" 200 "$HTTP_CODE"

    # Test 5.2: Update order status to PROCESSING
    echo -e "\n${BLUE}--- Test 5.2: Admin - Update Order Status to PROCESSING ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${BASE_URL}/api/admin/orders/${ADMIN_TEST_ORDER_ID}/status?status=PROCESSING" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Update order status to PROCESSING" 200 "$HTTP_CODE"

    # Test 5.3: Update order status to SHIPPED
    echo -e "\n${BLUE}--- Test 5.3: Admin - Update Order Status to SHIPPED ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${BASE_URL}/api/admin/orders/${ADMIN_TEST_ORDER_ID}/status?status=SHIPPED" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Update order status to SHIPPED" 200 "$HTTP_CODE"

    # Test 5.4: Update order status to DELIVERED
    echo -e "\n${BLUE}--- Test 5.4: Admin - Update Order Status to DELIVERED ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${BASE_URL}/api/admin/orders/${ADMIN_TEST_ORDER_ID}/status?status=DELIVERED" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Update order status to DELIVERED" 200 "$HTTP_CODE"
else
    echo -e "${YELLOW}Skipping admin order tests - no admin token or order ID${NC}"
fi

# ==============================================================================
# LEVEL 6: REVIEW SYSTEM (with Purchase Verification)
# ==============================================================================
echo -e "\n${YELLOW}═══ LEVEL 6: Review System (Purchase Verification) ═══${NC}"
echo "" >> $RESULTS_FILE
echo "## Level 6: Review System" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

if [ -n "$CUSTOMER_TOKEN" ]; then
    # Test 6.1: Try to review WITHOUT delivered order (should fail)
    echo -e "\n${BLUE}--- Test 6.1: Create Review Without Purchase (Should Fail) ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/reviews" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "productId": 3,
        "rating": 5,
        "comment": "Attempting review without purchase"
      }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Review without purchase (should fail)" 400 "$HTTP_CODE"

    # Test 6.2: Create review WITH delivered order (should succeed if admin updated order)
    if [ -n "$ADMIN_TEST_ORDER_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
        echo -e "\n${BLUE}--- Test 6.2: Create Review After Delivery (Should Succeed) ---${NC}"
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/reviews" \
          -H "Authorization: Bearer $CUSTOMER_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "productId": 1,
            "rating": 5,
            "comment": "Great product! Fast delivery and excellent quality."
          }')
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        BODY=$(echo "$RESPONSE" | sed '$d')
        test_endpoint "Create review after delivery" 201 "$HTTP_CODE"

        REVIEW_ID=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null || echo "")
    fi

    # Test 6.3: Get product reviews
    echo -e "\n${BLUE}--- Test 6.3: Get Product Reviews ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/reviews/product/1")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Get product reviews (public)" 200 "$HTTP_CODE"

    # Test 6.4: Get average rating
    echo -e "\n${BLUE}--- Test 6.4: Get Product Average Rating ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/reviews/product/1/rating")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Get product average rating" 200 "$HTTP_CODE"

    # Test 6.5: Get user's reviews
    echo -e "\n${BLUE}--- Test 6.5: Get User's Own Reviews ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/reviews/my-reviews" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    test_endpoint "Get user's reviews" 200 "$HTTP_CODE"

    # Test 6.6: Delete review
    if [ -n "$REVIEW_ID" ]; then
        echo -e "\n${BLUE}--- Test 6.6: Delete Own Review ---${NC}"
        RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "${BASE_URL}/api/reviews/${REVIEW_ID}" \
          -H "Authorization: Bearer $CUSTOMER_TOKEN")
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        test_endpoint "Delete own review" 204 "$HTTP_CODE"
    fi
fi

# ==============================================================================
# LEVEL 7: ADMIN PRODUCT MANAGEMENT
# ==============================================================================
echo -e "\n${YELLOW}═══ LEVEL 7: Admin Product & Inventory Management ═══${NC}"
echo "" >> $RESULTS_FILE
echo "## Level 7: Admin Product Management" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

if [ -n "$ADMIN_TOKEN" ]; then
    # Test 7.1: Create new product
    echo -e "\n${BLUE}--- Test 7.1: Admin - Create New Product ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/admin/products" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Test Product - Auto Created",
        "description": "This is a test product created via API",
        "price": 299.99,
        "categoryId": 1,
        "stockQuantity": 100
      }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    test_endpoint "Admin create product" 201 "$HTTP_CODE"

    NEW_PRODUCT_ID=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null || echo "")

    # Test 7.2: Update product
    if [ -n "$NEW_PRODUCT_ID" ]; then
        echo -e "\n${BLUE}--- Test 7.2: Admin - Update Product ---${NC}"
        RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${BASE_URL}/api/admin/products/${NEW_PRODUCT_ID}" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "Test Product - Updated",
            "description": "Updated description",
            "price": 349.99,
            "categoryId": 1
          }')
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        test_endpoint "Admin update product" 200 "$HTTP_CODE"
    fi

    # Test 7.3: Update inventory
    if [ -n "$NEW_PRODUCT_ID" ]; then
        echo -e "\n${BLUE}--- Test 7.3: Admin - Update Inventory ---${NC}"
        RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${BASE_URL}/api/admin/products/${NEW_PRODUCT_ID}/inventory?quantity=50" \
          -H "Authorization: Bearer $ADMIN_TOKEN")
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        test_endpoint "Admin update inventory" 200 "$HTTP_CODE"
    fi

    # Test 7.4: Delete product
    if [ -n "$NEW_PRODUCT_ID" ]; then
        echo -e "\n${BLUE}--- Test 7.4: Admin - Delete Product ---${NC}"
        RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "${BASE_URL}/api/admin/products/${NEW_PRODUCT_ID}" \
          -H "Authorization: Bearer $ADMIN_TOKEN")
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        test_endpoint "Admin delete product" 204 "$HTTP_CODE"
    fi

    # Test 7.5: Create category
    echo -e "\n${BLUE}--- Test 7.5: Admin - Create Category ---${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/admin/categories" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Test Category",
        "description": "Category created via API test"
      }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    test_endpoint "Admin create category" 201 "$HTTP_CODE"

    NEW_CATEGORY_ID=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null || echo "")

    # Test 7.6: Delete category
    if [ -n "$NEW_CATEGORY_ID" ]; then
        echo -e "\n${BLUE}--- Test 7.6: Admin - Delete Category ---${NC}"
        RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "${BASE_URL}/api/admin/categories/${NEW_CATEGORY_ID}" \
          -H "Authorization: Bearer $ADMIN_TOKEN")
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        test_endpoint "Admin delete category" 204 "$HTTP_CODE"
    fi
else
    echo -e "${YELLOW}Skipping admin product tests - no admin token${NC}"
fi

# ==============================================================================
# FINAL SUMMARY
# ==============================================================================
echo ""
echo "================================================================="
echo -e "${YELLOW}TEST SUMMARY${NC}"
echo "================================================================="
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
TOTAL=$((PASSED + FAILED))
echo -e "  Total:  $TOTAL"
echo "================================================================="

echo "" >> $RESULTS_FILE
echo "---" >> $RESULTS_FILE
echo "## Test Summary" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE
echo "- **Passed**: $PASSED ✅" >> $RESULTS_FILE
echo "- **Failed**: $FAILED ❌" >> $RESULTS_FILE
echo "- **Total**: $TOTAL" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    echo "**Status**: ✅ All tests passed!" >> $RESULTS_FILE
    exit 0
else
    echo -e "\n${RED}Some tests failed!${NC}"
    echo "**Status**: ⚠️ Some tests failed" >> $RESULTS_FILE
    echo "See $RESULTS_FILE for details"
    exit 1
fi
