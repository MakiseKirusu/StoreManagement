package com.store.main.exception;
//Invalid data = 404 error
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
