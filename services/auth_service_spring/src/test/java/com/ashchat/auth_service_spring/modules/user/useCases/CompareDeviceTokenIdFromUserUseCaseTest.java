package com.ashchat.auth_service_spring.modules.user.useCases;

import com.ashchat.auth_service_spring.exceptions.UserNotFoundError;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import com.ashchat.auth_service_spring.modules.user.services.CompareDeviceTokenIdFromUserUseCase;
import com.ashchat.auth_service_spring.providers.HashDeviceToken;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CompareDeviceTokenIdFromUserUseCaseTest {

    @InjectMocks
    private CompareDeviceTokenIdFromUserUseCase compareDeviceTokenIdFromUserUseCase;

    @Mock
    private UserRepository userRepository;

    @Test
    public void should_be_able_to_validate_user_device_by_id() throws Exception {
        String hashDeviceId = HashDeviceToken.hash("some_random_token");
        String userId = UUID.randomUUID().toString();
        UserEntity userToBeSearched = UserEntity
                .builder()
                .id(userId)
                .email("john.doe@example.com")
                .name("John Doe")
                .password("password123")
                .deviceTokenId(hashDeviceId)
                .deviceNotificationToken("some_random_token")
                .deviceOS("Windows 10")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(userToBeSearched));

        try{
            boolean isAValidTokenId = compareDeviceTokenIdFromUserUseCase.execute(userId, "some_random_token");
            assert isAValidTokenId;
        }
        catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    @Test
    public void should_not_be_able_to_validate_user_device_id_the_token_are_incorrect() throws Exception {
        String hashDeviceId = HashDeviceToken.hash("some_random_token");
        String userId = UUID.randomUUID().toString();
        UserEntity userToBeSearched = UserEntity
                .builder()
                .id(userId)
                .email("john.doe@example.com")
                .name("John Doe")
                .password("password123")
                .deviceTokenId(hashDeviceId)
                .deviceNotificationToken("some_random_token")
                .deviceOS("Windows 10")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(userToBeSearched));

        try{
            boolean isAValidTokenId = compareDeviceTokenIdFromUserUseCase.execute(userId, "some_random_tokem");
            assert !isAValidTokenId;
        }
        catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    @Test
    public void should_not_be_able_to_validate_user_device_id_the_id_are_incorrect() throws Exception{
        when(userRepository.findById("banana")).thenReturn(Optional.empty());

        try{
            compareDeviceTokenIdFromUserUseCase.execute("banana", "some_random_token");
        }
        catch (Exception e){
            assert e instanceof UserNotFoundError;
        }
    }
}
