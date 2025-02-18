package com.ashchat.auth_service_spring.modules.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConfirmationAccountCreatedDTO {
    private String id;
    private String nickname;
    private String preferredLanguage;
    private String unique_device_token;
    private String notification_token;
}
