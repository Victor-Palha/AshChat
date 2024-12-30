package com.ashchat.auth_service_spring.configs;

import org.springframework.amqp.core.Queue;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Queue to send to email service when a user tries to signup
    @Value("${broker.queue.email.creation}")
    private String emailCreationQueue;

    @Bean
    public Queue queues() {
        return new Queue(this.emailCreationQueue, true);
    }
}
