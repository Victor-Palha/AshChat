package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.constants.JWTTypes;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.providers.HashDeviceToken;
import com.ashchat.auth_service_spring.providers.JWTProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.time.Instant;
import java.util.UUID;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class RefreshTokenControllerTest {
    @Container
    static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:latest");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", mongoDBContainer::getReplicaSetUrl);
    }

    @Autowired
    private JWTProvider jwtProvider;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void should_be_able_to_refresh_a_user_token_if_credentials_are_correct() throws Exception {
        String userDeviceToken = HashDeviceToken.hash("some-device-token");
        String userNotificationToken = UUID.randomUUID().toString();
        String userPassword = new BCryptPasswordEncoder().encode("password123");
        UserEntity userMock = new UserEntity();
        userMock.setName("John Doe");
        userMock.setEmail("john.doe@example.com");
        userMock.setPassword(userPassword);
        userMock.setDeviceOS("IOS");
        userMock.setDeviceTokenId(userDeviceToken);
        userMock.setDeviceNotificationToken(userNotificationToken);
        mongoTemplate.save(userMock, "user_profile");

        String jwtToken = jwtProvider.generateJWTToken(
                userMock.getId(),
                JWTTypes.REFRESH,
                Instant.now().plusSeconds(3600)
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + jwtToken)
                        .header("device_token", "some-device-token")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Valid Refresh"))
                .andExpect(jsonPath("$.data.refresh_token").exists())
                .andExpect(jsonPath("$.data.token").exists());
    }

    @Test
    public void should_not_be_able_to_refresh_token_with_incorrect_device_token() throws Exception {
        String userDeviceToken = HashDeviceToken.hash("some-device-token");
        String userNotificationToken = UUID.randomUUID().toString();
        String userPassword = new BCryptPasswordEncoder().encode("password123");
        UserEntity userMock = new UserEntity();
        userMock.setName("John Doe");
        userMock.setEmail("john.doe@example.com");
        userMock.setPassword(userPassword);
        userMock.setDeviceOS("IOS");
        userMock.setDeviceTokenId(userDeviceToken);
        userMock.setDeviceNotificationToken(userNotificationToken);
        mongoTemplate.save(userMock, "user_profile");

        String jwtToken = jwtProvider.generateJWTToken(
                userMock.getId(),
                JWTTypes.REFRESH,
                Instant.now().plusSeconds(3600)
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + jwtToken)
                        .header("device_token", "some-device-token-1")
                )
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid Device Token"))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    public void should_not_be_able_to_refresh_token_with_invalid_jwt_token() throws Exception {
        String userDeviceToken = HashDeviceToken.hash("some-device-token");
        String userNotificationToken = UUID.randomUUID().toString();
        String userPassword = new BCryptPasswordEncoder().encode("password123");
        UserEntity userMock = new UserEntity();
        userMock.setName("John Doe");
        userMock.setEmail("john.doe@example.com");
        userMock.setPassword(userPassword);
        userMock.setDeviceOS("IOS");
        userMock.setDeviceTokenId(userDeviceToken);
        userMock.setDeviceNotificationToken(userNotificationToken);
        mongoTemplate.save(userMock, "user_profile");

        String jwtToken = jwtProvider.generateJWTToken(
                userMock.getId(),
                JWTTypes.MAIN,
                Instant.now().plusSeconds(3600)
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + jwtToken)
                        .header("device_token", "some-device-token-1")
                )
                .andExpect(status().isForbidden());
    }

    @Test
    public void should_not_be_able_to_refresh_token_with_invalid_subject_on_jwt_token() throws Exception {
        String userDeviceToken = HashDeviceToken.hash("some-device-token");
        String userNotificationToken = UUID.randomUUID().toString();
        String userPassword = new BCryptPasswordEncoder().encode("password123");
        UserEntity userMock = new UserEntity();
        userMock.setName("John Doe");
        userMock.setEmail("john.doe@example.com");
        userMock.setPassword(userPassword);
        userMock.setDeviceOS("IOS");
        userMock.setDeviceTokenId(userDeviceToken);
        userMock.setDeviceNotificationToken(userNotificationToken);
        mongoTemplate.save(userMock, "user_profile");

        String jwtToken = jwtProvider.generateJWTToken(
                "banana",
                JWTTypes.REFRESH,
                Instant.now().plusSeconds(3600)
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + jwtToken)
                        .header("device_token", "some-device-token-1")
                )
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User Not Found"));
    }
}
