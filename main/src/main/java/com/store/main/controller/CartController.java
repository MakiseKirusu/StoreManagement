package com.store.main.controller;

import com.store.main.dto.request.CartItemRequest;
import com.store.main.dto.response.MessageResponse;
import com.store.main.model.Cart;
import com.store.main.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCart(Authentication authentication) {
        String username = authentication.getName();
        Cart cart = cartService.getOrCreateCart(username);
        BigDecimal total = cartService.calculateCartTotal(cart);

        Map<String, Object> response = new HashMap<>();
        response.put("cart", cart);
        response.put("total", total);
        response.put("itemCount", cart.getItems().size());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItemToCart(
            @Valid @RequestBody CartItemRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        Cart cart = cartService.addItemToCart(username, request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<Cart> updateCartItem(
            @PathVariable Long productId,
            @RequestParam Integer quantity,
            Authentication authentication) {
        String username = authentication.getName();
        Cart cart = cartService.updateCartItemQuantity(username, productId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Cart> removeItemFromCart(
            @PathVariable Long productId,
            Authentication authentication) {
        String username = authentication.getName();
        Cart cart = cartService.removeItemFromCart(username, productId);
        return ResponseEntity.ok(cart);
    }
    
    @DeleteMapping
    public ResponseEntity<MessageResponse> clearCart(Authentication authentication) {
        String username = authentication.getName();
        cartService.clearCart(username);
        return ResponseEntity.ok(new MessageResponse("Cart cleared successfully!"));
    }
}
