package com.store.main.exception;

/**
 * Exception thrown when trying to order more items than available in stock.
 * Results in HTTP 400 Bad Request response.
 */
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String message) {
        super(message);
    }

    public InsufficientStockException(String productName, int requested, int available) {
        super(String.format("Insufficient stock for '%s'. Requested: %d, Available: %d",
                productName, requested, available));
    }
}
