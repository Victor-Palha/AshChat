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

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class ConfirmChangePasswordControllerTest {

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
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private JWTProvider jwtProvider;

    @BeforeEach
    void setupQueue() {
        rabbitTemplate.execute(channel -> {
            channel.queueDeclare("confirm_change_password_queue", true, false, false, null);
            return null;
        });

        new Thread(() -> rabbitTemplate.execute(channel -> {
            String queue = "confirm_change_password_queue";
            channel.basicConsume(queue, true, (_, message) -> {
                String replyQueue = message.getProperties().getReplyTo();
                String correlationId = message.getProperties().getCorrelationId();

                String response = """
                    {
                        "success": true,
                        "message": "Password change code validated"
                    }
                    """;

                AMQP.BasicProperties replyProps = new AMQP.BasicProperties
                        .Builder()
                        .correlationId(correlationId)
                        .build();

                channel.basicPublish("", replyQueue, replyProps, response.getBytes());
            }, _ -> {
            });
            return null;
        })).start();
    }

    @AfterEach
    void tearDownDatabase() {
        mongoTemplate.getDb().drop();
    }

    @Test
    public void should_change_password_if_code_is_valid() throws Exception {
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
        Instant expiryTime = Instant.now().plusSeconds(300);
        String JWTTemporaryToken = jwtProvider.generateJWTToken(
                userCreated.getId(),
                JWTTypes.TEMPORARY,
                expiryTime
        );

        String requestPayload = """
            {
                "emailCode": "123456",
                "newPassword": "new_secure_password"
            }
            """;

        mockMvc.perform(MockMvcRequestBuilders.patch("/api/user/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + JWTTemporaryToken)
                        .content(requestPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200));
    }
}
