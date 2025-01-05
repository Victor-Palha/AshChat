package com.ashchat.auth_service_spring.exceptions;

public class UserNotFoundError extends RuntimeException {
    public UserNotFoundError() {
        super("User Not Found");
    }
}
