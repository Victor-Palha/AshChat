package com.ashchat.auth_service_spring.exceptions;

public class InvalidTokenError extends RuntimeException {
    public InvalidTokenError() {
        super("Invalid token");
    }
}
