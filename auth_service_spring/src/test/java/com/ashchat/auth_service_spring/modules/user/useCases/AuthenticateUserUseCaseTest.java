package com.ashchat.auth_service_spring.modules.user.useCases;

import com.ashchat.auth_service_spring.exceptions.InvalidCredentialsError;
import com.ashchat.auth_service_spring.exceptions.NewDeviceTryingToLogError;
import com.ashchat.auth_service_spring.modules.user.dto.AuthenticateUserDTO;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import com.ashchat.auth_service_spring.modules.user.services.AuthenticateUserUseCase;
import com.ashchat.auth_service_spring.providers.HashDeviceToken;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthenticateUserUseCaseTest {

    @InjectMocks
    private AuthenticateUserUseCase authenticateUserUseCase;

    @Mock
    private UserRepository userRepository;

    @Test
    public void should_be_able_to_authenticate_user() throws Exception {
        String userDeviceToken = UUID.randomUUID().toString();
        String userDeviceTokenHashed = HashDeviceToken.hash(userDeviceToken);
        String userNotificationToken = UUID.randomUUID().toString();
        String passwordHashed = new BCryptPasswordEncoder().encode("password123");
        UserEntity userToBeSearched = new UserEntity();
        userToBeSearched.setId(UUID.randomUUID().toString());
        userToBeSearched.setName("John Doe");
        userToBeSearched.setEmail("john.doe@example.com");
        userToBeSearched.setPassword(passwordHashed);
        userToBeSearched.setDeviceOS("Windows 10");
        userToBeSearched.setDeviceTokenId(userDeviceTokenHashed);
        userToBeSearched.setDeviceNotificationToken(userNotificationToken);

        AuthenticateUserDTO authenticateUserDTO = AuthenticateUserDTO
                .builder()
                .email("john.doe@example.com")
                .deviceTokenId(userDeviceToken)
                .password("password123")
                .build();

        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(userToBeSearched));

        try {
            String userId = authenticateUserUseCase.execute(authenticateUserDTO);
            assert Objects.equals(userId, userToBeSearched.getId());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    public void should_not_be_able_to_authenticate_user_if_password_are_incorrect() throws Exception {
        String userDeviceToken = UUID.randomUUID().toString();
        String userDeviceTokenHashed = HashDeviceToken.hash(userDeviceToken);
        String userNotificationToken = UUID.randomUUID().toString();
        String passwordHashed = new BCryptPasswordEncoder().encode("password123");
        UserEntity userToBeSearched = new UserEntity();
        userToBeSearched.setId(UUID.randomUUID().toString());
        userToBeSearched.setName("John Doe");
        userToBeSearched.setEmail("john.doe@example.com");
        userToBeSearched.setPassword(passwordHashed);
        userToBeSearched.setDeviceOS("Windows 10");
        userToBeSearched.setDeviceTokenId(userDeviceTokenHashed);
        userToBeSearched.setDeviceNotificationToken(userNotificationToken);

        AuthenticateUserDTO authenticateUserDTO = AuthenticateUserDTO
                .builder()
                .email("john.doe@example.com")
                .deviceTokenId(userDeviceToken)
                .password("password124")
                .build();

        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(userToBeSearched));

        try {
            authenticateUserUseCase.execute(authenticateUserDTO);
        } catch (Exception e) {
            assert e instanceof InvalidCredentialsError;
        }
    }

    @Test
    public void should_not_be_able_to_authenticate_user_if_device_token_are_incorrect() throws Exception {
        String userDeviceToken = UUID.randomUUID().toString();
        String userDeviceTokenHashed = HashDeviceToken.hash(userDeviceToken);
        String userNotificationToken = UUID.randomUUID().toString();
        String passwordHashed = new BCryptPasswordEncoder().encode("password123");
        UserEntity userToBeSearched = new UserEntity();
        userToBeSearched.setId(UUID.randomUUID().toString());
        userToBeSearched.setName("John Doe");
        userToBeSearched.setEmail("john.doe@example.com");
        userToBeSearched.setPassword(passwordHashed);
        userToBeSearched.setDeviceOS("Windows 10");
        userToBeSearched.setDeviceTokenId(userDeviceTokenHashed);
        userToBeSearched.setDeviceNotificationToken(userNotificationToken);

        AuthenticateUserDTO authenticateUserDTO = AuthenticateUserDTO
                .builder()
                .email("john.doe@example.com")
                .deviceTokenId(UUID.randomUUID().toString())
                .password("password123")
                .build();

        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(userToBeSearched));

        try {
            authenticateUserUseCase.execute(authenticateUserDTO);
        } catch (Exception e) {
            assert e instanceof NewDeviceTryingToLogError;
        }
    }
}
