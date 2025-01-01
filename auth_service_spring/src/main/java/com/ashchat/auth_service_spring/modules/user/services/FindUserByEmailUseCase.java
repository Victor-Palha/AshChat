package com.ashchat.auth_service_spring.modules.user.services;

import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FindUserByEmailUseCase {
    private final UserRepository userRepository;
    public FindUserByEmailUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<UserEntity> execute(String email){
        return this.userRepository.findByEmail(email);
    }
}
