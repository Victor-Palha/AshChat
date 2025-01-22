package com.ashchat.auth_service_spring.modules.user.services;

import com.ashchat.auth_service_spring.exceptions.UserNotFoundError;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChangeUserPasswordUseCase {
    private final UserRepository userRepository;
    public ChangeUserPasswordUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserEntity execute(String newPassword, String userId) {
        Optional<UserEntity> userExists = userRepository.findById(userId);
        if (userExists.isEmpty()){
            throw new UserNotFoundError();
        }
        UserEntity userEntity = userExists.get();
        String newPasswordHashed = new BCryptPasswordEncoder().encode(newPassword);
        userEntity.setPassword(newPasswordHashed);
        userRepository.save(userEntity);
        return userEntity;
    }
}
