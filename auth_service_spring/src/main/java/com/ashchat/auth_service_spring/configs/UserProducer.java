package com.ashchat.auth_service_spring.configs;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class UserProducer {
    final RabbitTemplate rabbitTemplate;

    public UserProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Value("${broker.queue.email.creation}")
    private String emailCreationQueue;

    public void publishToQueueDefault(String queue, Map<String, Object> message) {
        // Exchange default
        rabbitTemplate.convertAndSend("", queue, message);
    }
}
