package com.ashchat.auth_service_spring.modules.user.useCases;

import com.ashchat.auth_service_spring.exceptions.UserNotFoundError;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import com.ashchat.auth_service_spring.modules.user.services.ChangeUserPasswordUseCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ChangeUserPasswordUseCaseTest {
    @InjectMocks
    private ChangeUserPasswordUseCase changeUserPasswordUseCase;

    @Mock
    private UserRepository userRepository;

    @Test
    public void should_change_user_password() {
        String oldPassword = new BCryptPasswordEncoder().encode("123456");
        UserEntity userMock = UserEntity
                .builder()
                .id("bananna")
                .name("John Doe")
                .email("bananna@gmail.com")
                .deviceTokenId(UUID.randomUUID().toString())
                .deviceOS("Android")
                .deviceNotificationToken(UUID.randomUUID().toString())
                .password(oldPassword)
                .build();

        String newPassword = "bananna123";
        when(userRepository.findById("bananna")).thenReturn(Optional.of(userMock));

        UserEntity response = changeUserPasswordUseCase.execute(newPassword, "bananna");
        assert !response.getPassword().equals(oldPassword);
        assert response.getPassword().length() > 10;
        assert response.getId().equals(userMock.getId());
    }

    @Test
    public void should_not_change_user_password_if_not_exist() {
        String newPassword = "bananna123";
        when(userRepository.findById("bananna")).thenReturn(Optional.empty());

        try{
            changeUserPasswordUseCase.execute(newPassword, "bananna");
        }
        catch (Exception e) {
            assert e instanceof UserNotFoundError;
        }
    }
}
