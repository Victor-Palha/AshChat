package com.ashchat.auth_service_spring.modules.user.useCases;

import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import com.ashchat.auth_service_spring.modules.user.services.FindUserByEmailUseCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FindUserByEmailUseCaseTest {

    @InjectMocks
    private FindUserByEmailUseCase findUserByEmailUseCase;

    @Mock
    private UserRepository userRepository;

    @Test
    public void should_be_able_to_find_user_by_email() {
        UserEntity userToBeSearched = UserEntity
                .builder()
                .email("john.doe@example.com")
                .name("John Doe")
                .password("password123")
                .deviceTokenId("1234567890")
                .deviceNotificationToken("some_random_token")
                .deviceOS("Windows 10")
                .build();

        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(userToBeSearched));

        Optional<UserEntity> userFound = findUserByEmailUseCase.execute("john.doe@example.com");
        assert userFound.isPresent();
        assert userFound.get().getEmail().equals(userToBeSearched.getEmail());
    }

    @Test
    public void should_not_be_able_to_find_user_by_email() {
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.empty());
        Optional<UserEntity> userFound = findUserByEmailUseCase.execute("john.doe@example.com");
        assert !userFound.isPresent();
    }
}
