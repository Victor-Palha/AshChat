package com.ashchat.auth_service_spring.modules.user.services;

import com.ashchat.auth_service_spring.exceptions.UserWithSameCredentialsAlreadyExists;
import com.ashchat.auth_service_spring.modules.user.dto.CreateTempNewUserDTO;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CreateTempUserUseCase {
    final private UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    public CreateTempUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public CreateTempNewUserDTO execute(CreateTempNewUserDTO tempUserDTO){
        Optional<UserEntity> userWithSameEmailExists = userRepository.findByEmail(tempUserDTO.getEmail());
        if(userWithSameEmailExists.isPresent()){
            throw new UserWithSameCredentialsAlreadyExists();
        }

        final String passwordHashed = this.passwordEncoder.encode(tempUserDTO.getPassword());
        tempUserDTO.setPassword(passwordHashed);

        return tempUserDTO;
    }
}
