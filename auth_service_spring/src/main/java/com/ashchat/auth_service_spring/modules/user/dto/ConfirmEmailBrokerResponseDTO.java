package com.ashchat.auth_service_spring.modules.user.dto;

import lombok.Data;


@Data
public class ConfirmEmailBrokerResponseDTO {
    private Boolean success;
    private String message;
    private ConfirmEmailBrokerResponseDataDTO data;
}

