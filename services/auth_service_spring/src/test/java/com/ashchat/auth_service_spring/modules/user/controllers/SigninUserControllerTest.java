package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.providers.HashDeviceToken;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.http.MediaType;

import java.util.UUID;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class SigninUserControllerTest {
    @Container
    static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:latest");

    @Container
    static RabbitMQContainer rabbitMQContainer = new RabbitMQContainer("rabbitmq:management");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", mongoDBContainer::getReplicaSetUrl);
        registry.add("spring.rabbitmq.addresses", rabbitMQContainer::getAmqpUrl);
    }

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void should_be_able_to_authenticate_an_user_if_all_information_are_correct() throws Exception {
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

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "email": "john.doe@example.com",
                                "password": "password123",
                                "deviceTokenId": "some-device-token"
                            }
                       """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User authenticated successfully"))
                .andExpect(jsonPath("$.data.refresh_token").exists())
                .andExpect(jsonPath("$.data.token").exists());
    }

    @Test
    public void should_not_be_able_to_authenticate_an_user_if_information_are_incorrect() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "email": "nonexistent@example.com",
                                "password": "wrongPassword",
                                "deviceTokenId": "unknownDevice"
                            }
                        """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    public void should_not_be_able_to_authenticate_an_user_if_device_id_are_different() throws Exception {
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

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "email": "john.doe@example.com",
                                "password": "password123",
                                "deviceTokenId": "some-device-token_2"
                            }
                       """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("A new device is trying to log in. Check your email to allow it."))
                .andExpect(jsonPath("$.data.token").exists());
    }
}
