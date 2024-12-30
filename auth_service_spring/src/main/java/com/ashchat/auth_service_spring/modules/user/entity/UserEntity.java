package com.ashchat.auth_service_spring.modules.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity(name = "user_profile")
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID userId;
    @Email()
    @Column(nullable = false, unique = true)
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
    @CreationTimestamp
    private LocalDateTime createdAt;
}
