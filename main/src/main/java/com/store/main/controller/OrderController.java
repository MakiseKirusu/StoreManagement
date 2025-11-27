package com.store.main.controller;

import com.store.main.dto.request.CheckoutRequest;
import com.store.main.model.Order;
import com.store.main.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for customer order operations.
 * Handles checkout, viewing orders, and cancellations.
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class OrderController {

    private final OrderService orderService;

    /**
     * Checkout - create an order from the cart.
     */
    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(
            @Valid @RequestBody CheckoutRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        Order order = orderService.checkout(username, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * Get all orders for the current user.
     */
    @GetMapping
    public ResponseEntity<Page<Order>> getUserOrders(
            Pageable pageable,
            Authentication authentication) {
        String username = authentication.getName();
        Page<Order> orders = orderService.getUserOrders(username, pageable);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get a specific order by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        Order order = orderService.getOrderById(username, id);
        return ResponseEntity.ok(order);
    }

    /**
     * Cancel an order.
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        Order order = orderService.cancelOrder(username, id);
        return ResponseEntity.ok(order);
    }
}
