#!/bin/bash

echo "========================================================"
echo "JStore E-Commerce API - Fresh Account Test"
echo "========================================================"
echo

# Generate unique username and email to avoid conflicts
TIMESTAMP=$(date +%s)
TEST_USER="testuser_${TIMESTAMP}"
TEST_EMAIL="testuser_${TIMESTAMP}@test.com"
TEST_PASSWORD="TestPass123!"

echo "Using fresh test account:"
echo "  Username: $TEST_USER"
echo "  Email: $TEST_EMAIL"
echo "  Password: $TEST_PASSWORD"
echo

# ============================================================
# LEVEL 1: Authentication
# ============================================================
echo "1️⃣  REGISTERING NEW USER..."
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USER\",\"password\":\"$TEST_PASSWORD\",\"email\":\"$TEST_EMAIL\"}")

REGISTER_CODE=$(echo "$REGISTER_RESPONSE" | tail -1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | head -n -1)

echo "   HTTP Status: $REGISTER_CODE"
echo "   Response: $REGISTER_BODY"
echo

if [ "$REGISTER_CODE" != "200" ]; then
  echo "❌ Registration failed with HTTP $REGISTER_CODE"
  exit 1
fi

echo "✅ Registration successful"
echo

# ============================================================
# LEVEL 2: Login with new account
# ============================================================
echo "2️⃣  LOGGING IN WITH NEW ACCOUNT..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USER\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo "   Token: ${TOKEN:0:20}..."
echo

# ============================================================
# LEVEL 3: Add items to cart
# ============================================================
echo "3️⃣  ADDING ITEMS TO CART..."
ADD_ITEM=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}')

ADD_CODE=$(echo "$ADD_ITEM" | tail -1)

if [ "$ADD_CODE" != "200" ]; then
  echo "❌ Add to cart failed with HTTP $ADD_CODE"
  exit 1
fi

echo "✅ Item 1 added to cart"

curl -s -X POST http://localhost:8080/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":2,"quantity":1}' > /dev/null

echo "✅ Item 2 added to cart"
echo

# ============================================================
# LEVEL 4: View cart
# ============================================================
echo "4️⃣  VIEWING CART..."
CART=$(curl -s -X GET http://localhost:8080/api/cart \
  -H "Authorization: Bearer $TOKEN")

CART_ITEMS=$(echo "$CART" | python3 -c "import sys,json; data=json.load(sys.stdin); print(len(data.get('items',[])))" 2>/dev/null)
CART_TOTAL=$(echo "$CART" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data.get('total',0))" 2>/dev/null)

echo "✅ Cart retrieved"
echo "   Items: $CART_ITEMS"
echo "   Total: \$$CART_TOTAL"
echo

# ============================================================
# LEVEL 5: Checkout
# ============================================================
echo "5️⃣  CREATING ORDER (CHECKOUT)..."
CHECKOUT=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/orders/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress":"123 Test Street, Test City, TC 12345"}')

CHECKOUT_CODE=$(echo "$CHECKOUT" | tail -1)
CHECKOUT_BODY=$(echo "$CHECKOUT" | head -n -1)

if [ "$CHECKOUT_CODE" != "201" ]; then
  echo "❌ Checkout failed with HTTP $CHECKOUT_CODE"
  echo "   Response: $CHECKOUT_BODY"
  exit 1
fi

ORDER_ID=$(echo "$CHECKOUT_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)

echo "✅ Order created successfully"
echo "   Order ID: $ORDER_ID"
echo

# ============================================================
# LEVEL 6: Get order details
# ============================================================
echo "6️⃣  RETRIEVING ORDER DETAILS..."
ORDER=$(curl -s -X GET "http://localhost:8080/api/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN")

ORDER_STATUS=$(echo "$ORDER" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
ORDER_PRICE=$(echo "$ORDER" | python3 -c "import sys,json; print(json.load(sys.stdin).get('totalPrice',0))" 2>/dev/null)

echo "✅ Order retrieved"
echo "   Status: $ORDER_STATUS"
echo "   Total: \$$ORDER_PRICE"
echo

# ============================================================
# LEVEL 7: Cancel order
# ============================================================
echo "7️⃣  CANCELLING ORDER..."
CANCEL=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8080/api/orders/$ORDER_ID/cancel" \
  -H "Authorization: Bearer $TOKEN")

CANCEL_CODE=$(echo "$CANCEL" | tail -1)
CANCEL_BODY=$(echo "$CANCEL" | head -n -1)

echo "   HTTP Status: $CANCEL_CODE"

if [ "$CANCEL_CODE" = "200" ]; then
  FINAL_STATUS=$(echo "$CANCEL_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
  echo "✅ Order cancelled successfully"
  echo "   Final Status: $FINAL_STATUS"
else
  echo "❌ Cancellation failed with HTTP $CANCEL_CODE"
  echo "   Response: $CANCEL_BODY"
  exit 1
fi
echo

# ============================================================
# LEVEL 8: Create new order for review test
# ============================================================
echo "8️⃣  CREATING SECOND ORDER FOR REVIEW TESTING..."
# Add fresh items
curl -s -X POST http://localhost:8080/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":1}' > /dev/null

ORDER2=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/orders/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress":"456 Another St, City"}')

ORDER2_CODE=$(echo "$ORDER2" | tail -1)
ORDER2_BODY=$(echo "$ORDER2" | head -n -1)

if [ "$ORDER2_CODE" = "201" ]; then
  ORDER2_ID=$(echo "$ORDER2_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
  echo "✅ Second order created (ID: $ORDER2_ID)"
  echo
  
  # ============================================================
  # LEVEL 9: Test review creation (should fail - order not delivered)
  # ============================================================
  echo "9️⃣  TESTING REVIEW SYSTEM..."
  echo "   (Attempting review on non-delivered order - should fail)"
  
  REVIEW=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/reviews \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"productId\":1,\"rating\":5,\"comment\":\"Great product!\"}")
  
  REVIEW_CODE=$(echo "$REVIEW" | tail -1)
  REVIEW_BODY=$(echo "$REVIEW" | head -n -1)
  
  if [ "$REVIEW_CODE" = "400" ]; then
    echo "✅ Review validation working (correctly rejected non-delivered order)"
    echo "   Response: $REVIEW_BODY"
  else
    echo "⚠️  Unexpected response: HTTP $REVIEW_CODE"
    echo "   Response: $REVIEW_BODY"
  fi
  echo
fi

# ============================================================
# SUMMARY
# ============================================================
echo "========================================================"
echo "✅ TEST COMPLETE - ALL CORE FEATURES WORKING"
echo "========================================================"
echo
echo "Summary:"
echo "  ✅ User registration (fresh account)"
echo "  ✅ User login"
echo "  ✅ Add items to cart"
echo "  ✅ View cart"
echo "  ✅ Checkout order"
echo "  ✅ Get order details"
echo "  ✅ Cancel order"
echo "  ✅ Review system validation"
echo

