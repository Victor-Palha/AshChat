package com.ashchat.auth_service_spring.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateNewUserDTO{
    String name;
    String password;
    String email;
    String deviceOS;
    String deviceTokenId;
    String deviceNotificationToken;
}
