package com.ashchat.auth_service_spring.configs;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

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

    public <T> T publishToRPCQueue(String queue, Map<String, Object> message, Class<T> responseType) {
        try{
            String correlationId = UUID.randomUUID().toString();
            Object response = rabbitTemplate.convertSendAndReceive(queue, message, messageResponse -> {
                messageResponse.getMessageProperties().setCorrelationId(correlationId);
                messageResponse.getMessageProperties().setReplyTo(queue);
                return messageResponse;
            });
            if(response != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                return objectMapper.convertValue(response, responseType);
            }else {
                throw new RuntimeException("No response received");
            }
        }
        catch (Exception e){
            e.printStackTrace();
            throw new RuntimeException("Failed to send message to RPC queue.", e);
        }
    }
}
