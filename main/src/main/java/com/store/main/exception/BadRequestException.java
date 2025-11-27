package com.store.main.exception;

/**
 * Exception thrown when a request contains invalid data.
 * Results in HTTP 400 Bad Request response.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
