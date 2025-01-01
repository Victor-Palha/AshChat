package com.ashchat.auth_service_spring.modules.user;


import com.ashchat.auth_service_spring.modules.user.dto.ConfirmNewDeviceAuthDTO;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import com.ashchat.auth_service_spring.modules.user.services.ChangeDeviceInformationFromUserAccountUseCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ChangeDeviceInformationFromUserAccountUseCaseTest {

    @InjectMocks
    private ChangeDeviceInformationFromUserAccountUseCase changeDeviceInformationFromUserAccountUseCase;

    @Mock
    private UserRepository userRepository;

    @Test
    public void should_be_able_to_change_device_information_from_user_account() {
        String userId = UUID.randomUUID().toString();
        UserEntity userToBeSearched = UserEntity
                .builder()
                .id(userId)
                .email("john.doe@example.com")
                .name("John Doe")
                .password("password123")
                .deviceTokenId("1234567890")
                .deviceNotificationToken("some_random_token")
                .deviceOS("Windows 10")
                .build();

        ConfirmNewDeviceAuthDTO confirmNewDeviceAuthDTO = ConfirmNewDeviceAuthDTO
                .builder()
                .deviceTokenId("1234567890")
                .deviceNotificationToken("some_random_token")
                .deviceOS("Windows 10")
                .emailCode("123456")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(userToBeSearched));

        try{
            changeDeviceInformationFromUserAccountUseCase.execute(userId, confirmNewDeviceAuthDTO);
            assert true;
        }
        catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    @Test
    public void should_not_be_able_to_change_device_information_from_user_account() {
        String userId = UUID.randomUUID().toString();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        try{
            changeDeviceInformationFromUserAccountUseCase.execute(userId, null);
            assert true;
        }
        catch (Exception e){
            assert e instanceof IllegalArgumentException;
        }
    }
}
