package com.ashchat.auth_service_spring.exceptions;

public class InvalidCredentialsError extends RuntimeException {
    public InvalidCredentialsError() {
      super("Invalid credentials");
    }
}
