package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.configs.UserProducer;
import com.ashchat.auth_service_spring.exceptions.UserWithSameCredentialsAlreadyExists;
import com.ashchat.auth_service_spring.modules.user.dto.CreateTempNewUserDTO;
import com.ashchat.auth_service_spring.modules.user.dto.EndpointResponse;
import com.ashchat.auth_service_spring.modules.user.services.CreateTempUserUseCase;
import com.ashchat.auth_service_spring.providers.CreateValidateCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Account Security", description = "User Account Security related endpoints")
public class SignupUserController {
    // Broker Queue
    @Value("${broker.queue.email.creation}")
    private String emailCreationQueue;
    // Use Cases
    final private CreateTempUserUseCase createTempUserUseCase;
    // Configs
    final private UserProducer userProducer;

    public SignupUserController(CreateTempUserUseCase createTempUserUseCase, UserProducer userProducer) {
        this.createTempUserUseCase = createTempUserUseCase;
        this.userProducer = userProducer;
    }

    @PostMapping("/signup")
    @Operation(summary = "Register a new user account", description = "This endpoint create a temporary user account and send a e-mail with a code to validate identity")
    @ApiResponse(responseCode = "202",description = "Verification email is being processed",content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "SuccessExample", value = "{ \"status\": 202, \"message\": \"Verification email is being processed\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "409", description = "User with same credentials already exists", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ConflictExample", value = "{ \"status\": 409, \"message\": \"User already exists\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "500", description = "Unexpected server error", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ServerErrorExample", value = "{ \"status\": 500, \"message\": \"Internal server error\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    public ResponseEntity<EndpointResponse<String>> execute(@RequestBody CreateTempNewUserDTO tempUserDTO) {

        try {
            CreateTempNewUserDTO createdUser = createTempUserUseCase.execute(tempUserDTO);
            final String validateCode = CreateValidateCode.generateEmailCodeHelper();
            Map<String, Object> emailMessageBrokerContent = new HashMap<>();
            emailMessageBrokerContent.put("email", createdUser.getEmail());
            emailMessageBrokerContent.put("emailCode", validateCode);
            emailMessageBrokerContent.put("nickname", createdUser.getName());
            emailMessageBrokerContent.put("password", createdUser.getPassword());
            emailMessageBrokerContent.put("preferredLanguage", createdUser.getPreferredLanguage());

            this.userProducer.publishToQueueDefault(
                    this.emailCreationQueue,
                    emailMessageBrokerContent
            );

            return ResponseEntity.status(202).body(
                    new EndpointResponse<>(202, "Verification email is being processed", null)
            );
        } catch (Exception e) {
            if (e instanceof UserWithSameCredentialsAlreadyExists) {
                return ResponseEntity.status(409).body(
                        new EndpointResponse<>(409, e.getMessage(), null)
                );
            }
            return ResponseEntity.status(500).body(
                    new EndpointResponse<>(500, e.getMessage(), null)
            );
        }
    }
}
