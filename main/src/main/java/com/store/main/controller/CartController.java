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

/**
 * Controller for managing shopping cart.
 * Only accessible to authenticated customers.
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    private final CartService cartService;

    /**
     * Get the current user's cart.
     */
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

    /**
     * Add an item to the cart.
     */
    @PostMapping("/items")
    public ResponseEntity<Cart> addItemToCart(
            @Valid @RequestBody CartItemRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        Cart cart = cartService.addItemToCart(username, request);
        return ResponseEntity.ok(cart);
    }

    /**
     * Update the quantity of a cart item.
     */
    @PutMapping("/items/{productId}")
    public ResponseEntity<Cart> updateCartItem(
            @PathVariable Long productId,
            @RequestParam Integer quantity,
            Authentication authentication) {
        String username = authentication.getName();
        Cart cart = cartService.updateCartItemQuantity(username, productId, quantity);
        return ResponseEntity.ok(cart);
    }

    /**
     * Remove an item from the cart.
     */
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Cart> removeItemFromCart(
            @PathVariable Long productId,
            Authentication authentication) {
        String username = authentication.getName();
        Cart cart = cartService.removeItemFromCart(username, productId);
        return ResponseEntity.ok(cart);
    }

    /**
     * Clear all items from the cart.
     */
    @DeleteMapping
    public ResponseEntity<MessageResponse> clearCart(Authentication authentication) {
        String username = authentication.getName();
        cartService.clearCart(username);
        return ResponseEntity.ok(new MessageResponse("Cart cleared successfully!"));
    }
}
