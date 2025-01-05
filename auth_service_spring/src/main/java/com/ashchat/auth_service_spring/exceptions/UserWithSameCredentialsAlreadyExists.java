package com.ashchat.auth_service_spring.exceptions;

public class UserWithSameCredentialsAlreadyExists extends RuntimeException {
    public UserWithSameCredentialsAlreadyExists() {
        super("User with same credentials already exists");
    }
}
