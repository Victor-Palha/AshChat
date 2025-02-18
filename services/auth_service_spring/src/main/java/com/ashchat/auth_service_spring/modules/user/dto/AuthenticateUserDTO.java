package com.ashchat.auth_service_spring.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticateUserDTO {
    private String email;
    private String password;
    private String deviceTokenId;
}
