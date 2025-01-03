package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.configs.UserProducer;
import com.ashchat.auth_service_spring.exceptions.UserWithSameCredentialsAlreadyExists;
import com.ashchat.auth_service_spring.modules.user.dto.*;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.services.CreateNewUserUseCase;
import com.ashchat.auth_service_spring.providers.HashDeviceToken;
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
public class ConfirmUserIdentityController {
    // Broker Queues
    @Value("${broker.queue.email.code.confirm}")
    private String emailConfirmationQueue;
    @Value("${broker.queue.email.creation.confirm}")
    private String emailConfirmationQueueCreation;
    // Use Cases
    final private CreateNewUserUseCase createNewUserUseCase;
    // Config
    final private UserProducer userProducer;

    public ConfirmUserIdentityController(
            CreateNewUserUseCase createNewUserUseCase,
            UserProducer userProducer
    ){
        this.createNewUserUseCase = createNewUserUseCase;
        this.userProducer = userProducer;
    }

    @PostMapping("/confirm-email")
    @Operation(summary = "Receive the email code from the user", description = "If email code matches with the code that was send then create the user account")
    @ApiResponse(responseCode = "201", description = "User Account Created", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "SuccessExample", value = "{ \"status\": 201, \"message\": \"Account created successfully\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "400", description = "Error with email code validation", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ConflictExample", value = "{ \"status\": 400, \"message\": \"Invalid email code\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "409", description = "User with same credentials already register on system", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ConflictExample", value = "{ \"status\": 409, \"message\": \"User with same credentials already register\",\"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "500", description = "Unexpected server error", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ServerErrorExample", value = "{ \"status\": 500, \"message\": \"Internal server error\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    public ResponseEntity<EndpointResponse<String>> execute(@RequestBody ConfirmEmailAndValidateAccountDTO confirmEmailAndValidateAccountDTO) {
        try {

            Map<String, Object> message = createMessageToBroker(confirmEmailAndValidateAccountDTO);

            ConfirmEmailBrokerResponseDTO response = userProducer.publishToRPCQueue(
                    this.emailConfirmationQueue,
                    message,
                    ConfirmEmailBrokerResponseDTO.class
            );

            if (!response.getSuccess()) {
                return ResponseEntity.status(400).body(
                        new EndpointResponse<>(400, response.getMessage(), null)
                );
            }
            // From now on, the device token id is hashed and the device is linked to the account
            String HashedDeviceToken = HashDeviceToken.hash(confirmEmailAndValidateAccountDTO.getDeviceTokenId());

            UserEntity userInformation = UserEntity
                    .builder()
                    .email(confirmEmailAndValidateAccountDTO.getEmail())
                    .name(response.getData().getNickname())
                    .password(response.getData().getPassword())
                    .deviceOS(confirmEmailAndValidateAccountDTO.getDeviceOS())
                    .deviceTokenId(HashedDeviceToken)
                    .deviceNotificationToken(confirmEmailAndValidateAccountDTO.getDeviceNotificationToken())
                    .build();

            UserEntity userCreated = this.createNewUserUseCase.execute(userInformation);
            ConfirmationAccountCreatedDTO messageToConfirmationToBroker = ConfirmationAccountCreatedDTO
                    .builder()
                    .id(userCreated.getId())
                    .nickname(userCreated.getName())
                    .preferredLanguage(response.getData().getPreferredLanguage())
                    .unique_device_token(HashedDeviceToken)
                    .notification_token(confirmEmailAndValidateAccountDTO.getDeviceNotificationToken())
                    .build();

            this.userProducer.publishToQueueDefault(
                    this.emailConfirmationQueueCreation,
                    confirmationAccountCreationToBroker(messageToConfirmationToBroker)
            );

            return ResponseEntity.status(201).body(
                    new EndpointResponse<>(201, "Account created successfully", null)
            );

        } catch (Exception e) {
            if (e instanceof UserWithSameCredentialsAlreadyExists){
                // 409
                return ResponseEntity.status(409).body(
                        new EndpointResponse<>(409, "User with same credentials already exists", null)
                );
            }
            return ResponseEntity.status(500).body(
                    new EndpointResponse<>(500, "Unexpected server error", null)
            );
        }
    }

    private static Map<String, Object> createMessageToBroker(ConfirmEmailAndValidateAccountDTO confirmEmailAndValidateAccountDTO) {
        Map<String, Object> message = new HashMap<>();
        message.put("email", confirmEmailAndValidateAccountDTO.getEmail());
        message.put("emailCode", confirmEmailAndValidateAccountDTO.getEmailCode());
        message.put("deviceTokenId", confirmEmailAndValidateAccountDTO.getDeviceTokenId());
        message.put("deviceNotificationToken", confirmEmailAndValidateAccountDTO.getDeviceNotificationToken());
        message.put("deviceOS", confirmEmailAndValidateAccountDTO.getDeviceOS());
        return message;
    }
    private static Map<String, Object> confirmationAccountCreationToBroker(ConfirmationAccountCreatedDTO confirmationAccountCreatedDTO) {
        Map<String, Object> message = new HashMap<>();
        message.put("id", confirmationAccountCreatedDTO.getId());
        message.put("nickname", confirmationAccountCreatedDTO.getNickname());
        message.put("preferredLanguage", confirmationAccountCreatedDTO.getPreferredLanguage());
        message.put("unique_device_token", confirmationAccountCreatedDTO.getUnique_device_token());
        message.put("notification_token", confirmationAccountCreatedDTO.getNotification_token());
        return message;
    }

}
