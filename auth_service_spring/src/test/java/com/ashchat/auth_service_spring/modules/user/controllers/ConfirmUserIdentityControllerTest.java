package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.configs.UserProducer;
import com.ashchat.auth_service_spring.modules.user.dto.ConfirmEmailBrokerResponseDTO;
import com.ashchat.auth_service_spring.modules.user.dto.ConfirmEmailBrokerResponseDataDTO;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.providers.HashDeviceToken;
import com.rabbitmq.client.AMQP;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
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
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
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
    private RabbitTemplate rabbitTemplate;

    @BeforeEach
    void setupQueue() {
        // Declare and configure the queue where the requests will go
        rabbitTemplate.execute(channel -> {
            channel.queueDeclare("confirm_email_code_queue", true, false, false, null); // Durable queue
            return null;
        });

        // Start a consumer thread that listens for messages on the "confirm_email_code_queue"
        new Thread(() -> {
            rabbitTemplate.execute(channel -> {
                // Listen for messages on the queue
                String queue = "confirm_email_code_queue";
                channel.basicConsume(queue, true, (consumerTag, message) -> {
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
                }, consumerTag -> { });
                return null;
            });
        }).start();
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
}