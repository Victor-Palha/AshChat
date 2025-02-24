package com.ashchat.auth_service_spring.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmChangePasswordDTO {
    @Length(min = 6)
    private String newPassword;
    @Length(min = 6, max = 6)
    private String emailCode;
}
