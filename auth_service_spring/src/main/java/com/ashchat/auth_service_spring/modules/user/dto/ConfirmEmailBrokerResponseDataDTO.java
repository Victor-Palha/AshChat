package com.ashchat.auth_service_spring.modules.user.dto;

import lombok.Data;

@Data
public class ConfirmEmailBrokerResponseDataDTO {
   private String email;
   private String nickname;
   private String password;
   private String preferredLanguage;
}
