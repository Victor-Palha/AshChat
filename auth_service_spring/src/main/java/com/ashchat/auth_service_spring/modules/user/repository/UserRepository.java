package com.ashchat.auth_service_spring.modules.user.repository;

import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends MongoRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmail(String email);
}
