package com.ashchat.auth_service_spring.modules.user.services;

import com.ashchat.auth_service_spring.exceptions.UserNotFoundError;
import com.ashchat.auth_service_spring.modules.user.dto.ConfirmNewDeviceAuthDTO;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import com.ashchat.auth_service_spring.providers.HashDeviceToken;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;

@Service
public class ChangeDeviceInformationFromUserAccountUseCase {

    final private UserRepository userRepository;
    public ChangeDeviceInformationFromUserAccountUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserEntity execute(String userId, ConfirmNewDeviceAuthDTO confirmNewDeviceAuthDTO) throws UnsupportedEncodingException, NoSuchAlgorithmException {
        Optional<UserEntity> userExists = this.userRepository.findById(userId);
        if(userExists.isEmpty()) {
            throw new UserNotFoundError();
        }
        UserEntity user = userExists.get();
        user.setDeviceOS(confirmNewDeviceAuthDTO.getDeviceOS());
        user.setDeviceTokenId(confirmNewDeviceAuthDTO.getDeviceTokenId());
        user.setDeviceNotificationToken(confirmNewDeviceAuthDTO.getDeviceNotificationToken());

        return this.userRepository.save(user);
    }
}
