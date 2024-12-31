package com.ashchat.auth_service_spring.modules.user.services;

import com.ashchat.auth_service_spring.exceptions.InvalidCredentialsError;
import com.ashchat.auth_service_spring.exceptions.NewDeviceTryingToLogError;
import com.ashchat.auth_service_spring.modules.user.dto.AuthenticateUserDTO;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import com.ashchat.auth_service_spring.providers.HashDeviceToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;

@Service
public class AuthenticateUserUseCase {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final UserRepository userRepository;
    public AuthenticateUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String execute(AuthenticateUserDTO authenticateUserDTO) throws UnsupportedEncodingException, NoSuchAlgorithmException {
        Optional<UserEntity> userExists = this.userRepository.findByEmail(authenticateUserDTO.getEmail());
        if(userExists.isEmpty()){
            throw new InvalidCredentialsError();
        }
        boolean isMatchPassword = this.passwordEncoder.matches(authenticateUserDTO.getPassword(), userExists.get().getPassword());
        if (!isMatchPassword){
            throw new InvalidCredentialsError();
        }
        String hashDeviceToken = HashDeviceToken.hash(authenticateUserDTO.getDeviceTokenId());
        if (!hashDeviceToken.equals(userExists.get().getDeviceTokenId())){
            throw new NewDeviceTryingToLogError();
        }
        return userExists.get().getId();
    }
}
