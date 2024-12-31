package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.configs.UserProducer;
import com.ashchat.auth_service_spring.exceptions.UserWithSameCredentialsAlreadyExists;
import com.ashchat.auth_service_spring.modules.user.dto.CreateTempNewUserDTO;
import com.ashchat.auth_service_spring.modules.user.services.CreateTempUserUseCase;
import com.ashchat.auth_service_spring.security.CreateValidateCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UsersController {
    // Queues to Message Broker
    @Value("${broker.queue.email.creation}")
    private String emailCreationQueue;

    // Dependencies
    final private CreateTempUserUseCase createTempUserUseCase;
    final private UserProducer userProducer;
    public UsersController(CreateTempUserUseCase createTempUserUseCase, UserProducer userProducer) {
        this.createTempUserUseCase = createTempUserUseCase;
        this.userProducer = userProducer;
    }

    @PostMapping("/signup")
    public ResponseEntity<Object> registerUser(@RequestBody CreateTempNewUserDTO tempUserDTO) {
        System.out.println(tempUserDTO);
        try{
            CreateTempNewUserDTO createdUser = createTempUserUseCase.execute(tempUserDTO);
            final String validateCode = CreateValidateCode.generateEmailCodeHelper();
            Map<String, Object> message = new HashMap<>();
            message.put("email", createdUser.getEmail());
            message.put("emailCode", validateCode);
            message.put("nickname", createdUser.getName());
            message.put("password", createdUser.getPassword());
            message.put("preferredLanguage", createdUser.getPreferredLanguage());

            this.userProducer.publishToQueueDefault(
                    this.emailCreationQueue,
                    message
            );
            HashMap<String, String> response = new HashMap<>();
            response.put("message", "Verification email is being processed");

            return ResponseEntity.status(202).body(response);
        }catch (Exception e){
            if (e instanceof UserWithSameCredentialsAlreadyExists){
                return ResponseEntity.status(409).body(e.getMessage());
            }
            HashMap<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/signin")
    public void authenticateUser() {

    }
}
