package com.ashchat.auth_service_spring.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmEmailBrokerResponseDataDTO {
   private String email;
   private String nickname;
   private String password;
   private String preferredLanguage;
}
