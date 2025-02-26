package com.ashchat.auth_service_spring.modules.user.entity;

import jakarta.validation.constraints.Email;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Data
@Document(collection = "user_profile")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    @Id
    private String id;
    @Email()
    private String email;
    @Length(min = 6)
    private String password;
    @Length(min = 2)
    private String name;
    @Length(min = 2)
    private String deviceOS;
    @Length(min = 1)
    private String deviceTokenId;
    @Length(min = 2)
    private String deviceNotificationToken;
}
