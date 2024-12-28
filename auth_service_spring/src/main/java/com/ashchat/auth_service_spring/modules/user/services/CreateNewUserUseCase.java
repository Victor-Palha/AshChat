package com.ashchat.auth_service_spring.modules.user.services;

import com.ashchat.auth_service_spring.exceptions.UserWithSameCredentialsAlreadyExists;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CreateNewUserUseCase {
    private final UserRepository userRepository;
    public CreateNewUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserEntity execute(UserEntity createNewUser) {
        final String email = createNewUser.getEmail();
        Optional<UserEntity> userExists = this.userRepository.findByEmail(email);
        if (userExists.isPresent()){
            throw new UserWithSameCredentialsAlreadyExists();
        }
        return this.userRepository.save(createNewUser);
    }
}
