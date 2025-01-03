package com.ashchat.auth_service_spring.modules.user.useCases;

import com.ashchat.auth_service_spring.modules.user.dto.CreateTempNewUserDTO;
import com.ashchat.auth_service_spring.modules.user.repository.UserRepository;
import com.ashchat.auth_service_spring.modules.user.services.CreateTempUserUseCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Objects;
import java.util.Optional;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CreateTempUserUseCaseTest {

    @InjectMocks
    private CreateTempUserUseCase createTempUserUseCase;

    @Mock
    private UserRepository userRepository;

    @Test
    public void should_be_able_to_create_a_temp_user() {
        CreateTempNewUserDTO tempUserDto = CreateTempNewUserDTO
                .builder()
                .name("John Doe")
                .email("john.doe@example.com")
                .password("password123")
                .preferredLanguage("EN")
                .build();

//        when(passwordEncoder.encode(tempUserDto.getPassword())).thenReturn("someHashedPassword");
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.empty());
        try{
            CreateTempNewUserDTO createdTempUser = createTempUserUseCase.execute(tempUserDto);
            assert !Objects.equals(createdTempUser.getPassword(), "password123");
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
