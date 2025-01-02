package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.modules.user.dto.CreateTempNewUserDTO;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class SignupUserControllerTest {

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
    public void should_be_able_to_register_a_new_user() throws Exception {
        CreateTempNewUserDTO request = new CreateTempNewUserDTO(
                "test@example.com",
                "TestUser",
                "password123",
                "en"
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "email": "test@example.com",
                                "name": "TestUser",
                                "password": "password123",
                                "preferredLanguage": "en"
                            }
                        """))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").value("Verification email is being processed"));
    }

    @Test
    public void should_not_be_able_to_register_an_user_if_email_already_registered() throws Exception {
        String userDeviceToken = UUID.randomUUID().toString();
        String userNotificationToken = UUID.randomUUID().toString();
        UserEntity newUser = new UserEntity();
        newUser.setName("John Doe");
        newUser.setEmail("john.doe@example.com");
        newUser.setPassword("password");
        newUser.setDeviceOS("Windows 10");
        newUser.setDeviceTokenId(userDeviceToken);
        newUser.setDeviceNotificationToken(userNotificationToken);
        mongoTemplate.save(newUser, "user_profile");
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "email": "john.doe@example.com",
                                "name": "DuplicateUser",
                                "password": "password123",
                                "preferredLanguage": "en"
                            }
                        """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("User with same credentials already exists"));
    }

    @Test
    public void should_not_be_able_to_register_an_user_if_information_are_incomplete() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "email": "error@example.com",
                                "preferredLanguage": "en"
                            }
                        """))
                .andExpect(status().isInternalServerError());
    }
}
