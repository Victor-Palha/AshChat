package com.ashchat.auth_service_spring.modules.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response message format")
public class EndpointResponse<T> {
    private int status;
    private String message;
    private T data;

    public EndpointResponse(int status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    // Getters e Setters
    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
