package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.constants.JWTTypes;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.providers.JWTProvider;
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

import java.time.Instant;
import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class ConfirmNewDeviceToLinkWithAccountControllerTest {
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

    @Autowired
    private JWTProvider jwtProvider;

    @BeforeEach
    void setupQueue() {
        // Declare and configure the queue where the requests will go
        rabbitTemplate.execute(channel -> {
            channel.queueDeclare("confirm_new_device_reply_queue", true, false, false, null); // Durable queue
            return null;
        });

        new Thread(() -> rabbitTemplate.execute(channel -> {
            // Listen for messages on the queue
            String queue = "confirm_new_device_reply_queue";
            channel.basicConsume(queue, true, (_, message) -> {
                String replyQueue = message.getProperties().getReplyTo();
                String correlationId = message.getProperties().getCorrelationId();

                // Prepare the response message
                String response = """
                    {
                        "success": true,
                        "message": "Device successfully confirmed"
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
    public void should_be_able_to_confirm_a_new_device_to_link_with_an_account() throws Exception {
        String userDeviceToken = UUID.randomUUID().toString();
        String userNotificationToken = UUID.randomUUID().toString();
        UserEntity userToBeCreated = new UserEntity();
        userToBeCreated.setName("John Doe");
        userToBeCreated.setEmail("john.doe@example.com");
        userToBeCreated.setPassword("password");
        userToBeCreated.setDeviceOS("Windows 10");
        userToBeCreated.setDeviceTokenId(userDeviceToken);
        userToBeCreated.setDeviceNotificationToken(userNotificationToken);
        UserEntity userCreated = mongoTemplate.save(userToBeCreated, "user_profile");

        String requestPayload = """
            {
                "emailCode": "123456",
                "deviceTokenId": "device123",
                "deviceNotificationToken": "notif123",
                "deviceOS": "ANDROID"
            }
        """;
        Instant expiryTime = Instant.now().plusSeconds(300);
        String JWTTemporaryToken = jwtProvider.generateJWTToken(
                userCreated.getId(),
                JWTTypes.TEMPORARY,
                expiryTime
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/confirm-new-device")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + JWTTemporaryToken)
                        .content(requestPayload))
                .andExpect(status().isNoContent());
    }

    @Test
    public void should_not_be_able_to_confirm_a_new_device_to_link_with_an_account_if_jwt_token_is_invalid() throws Exception {
        String userDeviceToken = UUID.randomUUID().toString();
        String userNotificationToken = UUID.randomUUID().toString();
        UserEntity userToBeCreated = new UserEntity();
        userToBeCreated.setName("John Doe");
        userToBeCreated.setEmail("john.doe@example.com");
        userToBeCreated.setPassword("password");
        userToBeCreated.setDeviceOS("Windows 10");
        userToBeCreated.setDeviceTokenId(userDeviceToken);
        userToBeCreated.setDeviceNotificationToken(userNotificationToken);
        mongoTemplate.save(userToBeCreated, "user_profile");

        String requestPayload = """
            {
                "emailCode": "123456",
                "deviceTokenId": "device123",
                "deviceNotificationToken": "notif123",
                "deviceOS": "ANDROID"
            }
        """;
        Instant expiryTime = Instant.now().plusSeconds(300);
        String JWTTemporaryToken = jwtProvider.generateJWTToken(
                "banana",
                JWTTypes.TEMPORARY,
                expiryTime
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/confirm-new-device")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + JWTTemporaryToken)
                        .content(requestPayload))
                .andExpect(status().isNotFound());
    }
}
