#!/bin/bash

echo "=== Testing Order Cancellation Fix ==="
echo

# Login
echo "1. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"password123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

if [ -z "$TOKEN" ]; then
  echo "Login failed"
  exit 1
fi
echo "   Token obtained: ${TOKEN:0:20}..."
echo

# Add item to cart
echo "2. Adding item to cart..."
curl -s -X POST http://localhost:8080/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}' > /dev/null
echo "   Item added"
echo

# Checkout
echo "3. Creating order (checkout)..."
ORDER_ID=$(curl -s -X POST http://localhost:8080/api/orders/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress":"123 Test St, City"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

if [ -z "$ORDER_ID" ]; then
  echo "   Checkout failed"
  exit 1
fi
echo "   Order created with ID: $ORDER_ID"
echo

# Cancel order
echo "4. Cancelling order $ORDER_ID..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8080/api/orders/$ORDER_ID/cancel" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "   HTTP Status: $HTTP_CODE"
echo "   Response: $BODY"
echo

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ SUCCESS: Order cancellation worked!"
  echo
  echo "5. Verifying order status..."
  curl -s -X GET "http://localhost:8080/api/orders/$ORDER_ID" \
    -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; data=json.load(sys.stdin); print(f\"   Order Status: {data['status']}\")"
else
  echo "❌ FAILED: Order cancellation returned HTTP $HTTP_CODE"
  echo "   This may indicate the bug is not fixed"
fi
