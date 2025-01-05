package com.ashchat.auth_service_spring.exceptions;

public class NewDeviceTryingToLogError extends RuntimeException {
    public NewDeviceTryingToLogError() {
        super("Invalid device token");
    }
}
