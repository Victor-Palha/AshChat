package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.rabbitmq.client.AMQP;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
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

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class ConfirmUserIdentityControllerTest {

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
    private MockMvc mockMvc;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @BeforeEach
    void setupQueue() {
        // Declare and configure the queue where the requests will go
        rabbitTemplate.execute(channel -> {
            channel.queueDeclare("confirm_email_code_queue", true, false, false, null); // Durable queue
            return null;
        });

        new Thread(() -> rabbitTemplate.execute(channel -> {
            // Listen for messages on the queue
            String queue = "confirm_email_code_queue";
            channel.basicConsume(queue, true, (_, message) -> {
                String replyQueue = message.getProperties().getReplyTo();
                String correlationId = message.getProperties().getCorrelationId();

                // Prepare the response message
                String response = """
                    {
                        "success": true,
                        "message": "Email code validated",
                        "data": {
                            "nickname": "John Doe",
                            "password": "hashed_password",
                            "preferredLanguage": "en"
                        }
                    }
                    """;

                // Send the response
                AMQP.BasicProperties replyProps = new AMQP.BasicProperties
                        .Builder()
                        .correlationId(correlationId)
                        .build();

                // Publish response to the reply queue
                channel.basicPublish("", replyQueue, replyProps, response.getBytes());
            }, _ -> { });
            return null;
        })).start();
    }

    @AfterEach
    void tearDownDatabase() {
        mongoTemplate.getDb().drop();
    }

    @Test
    public void should_create_user_account_if_email_code_is_valid() throws Exception {
        String requestPayload = """
            {
                "email": "john.doe@example.com",
                "emailCode": "123456",
                "deviceTokenId": "device123",
                "deviceNotificationToken": "notif123",
                "deviceOS": "ANDROID"
            }
            """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/confirm-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.message").value("Account created successfully"));
    }

    @Test
    public void should_not_be_able_to_create_user_account_if_email_already_registered() throws Exception {
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
        String requestPayload = """
            {
                "email": "john.doe@example.com",
                "emailCode": "123456",
                "deviceTokenId": "device123",
                "deviceNotificationToken": "notif123",
                "deviceOS": "ANDROID"
            }
            """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/confirm-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestPayload))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("User with same credentials already exists"));
    }
}