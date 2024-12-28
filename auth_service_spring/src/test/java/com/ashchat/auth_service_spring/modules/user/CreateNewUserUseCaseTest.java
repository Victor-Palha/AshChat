package com.ashchat.auth_service_spring.modules.user;

import com.ashchat.auth_service_spring.exceptions.UserWithSameCredentialsAlreadyExists;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import com.ashchat.auth_service_spring.modules.user.services.CreateNewUserUseCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
public class CreateNewUserUseCaseTest {

    @InjectMocks
    private CreateNewUserUseCase createNewUserUseCase;

    @Mock
    private UserRepository userRepository;

    @Test
    public void should_be_able_to_create_user() {
        String userDeviceToken = UUID.randomUUID().toString();
        String userNotificationToken = UUID.randomUUID().toString();
        UserEntity newUser = UserEntity
                .builder()
                .name("John Doe")
                .email("john.doe@example.com")
                .password("password")
                .deviceOS("Windows 10")
                .deviceTokenId(userDeviceToken)
                .deviceNotificationToken(userNotificationToken)
                .build();
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(newUser)).thenReturn(newUser);
        try{
            UserEntity userCreated = createNewUserUseCase.execute(newUser);
            assert userCreated != null;
            assert userCreated.getEmail().equals(newUser.getEmail());
        }catch (Exception e){
            assert e instanceof UserWithSameCredentialsAlreadyExists;
        }
    }
}
