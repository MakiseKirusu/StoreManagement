package com.store.main.model.enums;

/**
 * Enum representing the lifecycle status of an order.
 * - PENDING: Order has been created but not yet processed
 * - PROCESSING: Order is being prepared/packaged
 * - SHIPPED: Order has been dispatched for delivery
 * - DELIVERED: Order has been successfully delivered to customer
 * - CANCELLED: Order has been cancelled by customer or admin
 */
public enum OrderStatus {
    PENDING,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
