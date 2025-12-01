package com.store.main.exception;

//Insufficient stock = 400 error
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String message) {
        super(message);
    }

    public InsufficientStockException(String productName, int requested, int available) {
        super(String.format("Insufficient stock for '%s'. Requested: %d, Available: %d",
                productName, requested, available));
    }
}
