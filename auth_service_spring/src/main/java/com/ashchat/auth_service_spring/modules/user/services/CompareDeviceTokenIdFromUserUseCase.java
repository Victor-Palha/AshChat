package com.ashchat.auth_service_spring.modules.user.services;

import com.ashchat.auth_service_spring.exceptions.UserNotFoundError;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import com.ashchat.auth_service_spring.providers.HashDeviceToken;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;

@Service
public class CompareDeviceTokenIdFromUserUseCase {

    final private UserRepository userRepository;

    public CompareDeviceTokenIdFromUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean execute(String userId, String deviceTokenId) throws UnsupportedEncodingException, NoSuchAlgorithmException {
        Optional<UserEntity> userSearched = userRepository.findById(userId);
        if(userSearched.isEmpty()){
            throw new UserNotFoundError();
        }

        String deviceTokenIdSearched = userSearched.get().getDeviceTokenId();
        String deviceTokenIdToCompare = HashDeviceToken.hash(deviceTokenId);

        return deviceTokenIdSearched.equals(deviceTokenIdToCompare);
    }
}
