package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.configs.UserProducer;
import com.ashchat.auth_service_spring.exceptions.UserNotFoundError;
import com.ashchat.auth_service_spring.modules.user.dto.ConfirmNewDeviceAuthDTO;
import com.ashchat.auth_service_spring.modules.user.dto.ConfirmaNewDeviceBrokerResponseDTO;
import com.ashchat.auth_service_spring.modules.user.dto.EndpointResponse;
import com.ashchat.auth_service_spring.modules.user.services.ChangeDeviceInformationFromUserAccountUseCase;
import com.ashchat.auth_service_spring.providers.HashDeviceToken;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Account Security", description = "User Account Security related endpoints")
public class ConfirmNewDeviceToLinkWithAccountController {
    // Message Broker Queue
    @Value("${broker.queue.email.device.confirm}")
    private String emailDeviceConfirmationQueue;
    @Value("${broker.queue.chat.device.new}")
    private String chatDeviceNewQueue;
    // Use Cases
    final private ChangeDeviceInformationFromUserAccountUseCase changeDeviceInformationFromUserAccountUseCase;
    //Configs
    final private UserProducer userProducer;

    public ConfirmNewDeviceToLinkWithAccountController(
            ChangeDeviceInformationFromUserAccountUseCase changeDeviceInformationFromUserAccountUseCase,
            UserProducer userProducer
    ){
        this.changeDeviceInformationFromUserAccountUseCase = changeDeviceInformationFromUserAccountUseCase;
        this.userProducer = userProducer;
    }

    @PostMapping("/confirm-new-device")
    @PreAuthorize("hasRole('TEMPORARY')")
    @Operation(summary = "Confirm new device to link account", description = "Receives the email code and link the new device to the user account")
    @ApiResponse(responseCode = "204", description = "New device was confirmed")
    @ApiResponse(responseCode = "403", description = "Invalid Email Code", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ConflictExample", value = "{ \"status\": 403, \"message\": \"Invalid Email Code\",\"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "404", description = "User Not Found", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "NotFoundError", value = "{ \"status\": 404, \"message\": \"User not found\",\"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "500", description = "Unexpected server error", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ServerErrorExample", value = "{ \"status\": 500, \"message\": \"Internal server error\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    @SecurityRequirement(name = "jwt_auth")
    public ResponseEntity<Object> execute(HttpServletRequest request, @RequestBody ConfirmNewDeviceAuthDTO confirmNewDeviceAuthDTO) throws Exception {

        final String userId = request.getAttribute("user_id").toString();

        try {
            String hashedDeviceToken = HashDeviceToken.hash(confirmNewDeviceAuthDTO.getDeviceTokenId());
            confirmNewDeviceAuthDTO.setDeviceTokenId(hashedDeviceToken);

            Map<String, Object> messageToBroker = new HashMap<>();
            messageToBroker.put("user_id", userId);
            messageToBroker.put("deviceUniqueToken", hashedDeviceToken);
            messageToBroker.put("emailCode", confirmNewDeviceAuthDTO.getEmailCode());
            ConfirmaNewDeviceBrokerResponseDTO response = this.userProducer.publishToRPCQueue(
                    this.emailDeviceConfirmationQueue,
                    messageToBroker,
                    ConfirmaNewDeviceBrokerResponseDTO.class
            );
            if (!response.isSuccess()) {
                // 403
                return ResponseEntity.status(403).body(
                        new EndpointResponse<>(403, response.getMessage(), null)
                );
            }
            this.changeDeviceInformationFromUserAccountUseCase.execute(userId, confirmNewDeviceAuthDTO);

            Map<String, Object> messageToChatBroker = new HashMap<>();
            messageToChatBroker.put("id", userId);
            messageToChatBroker.put("unique_device_token", confirmNewDeviceAuthDTO.getDeviceTokenId());
            messageToChatBroker.put("notification_token", confirmNewDeviceAuthDTO.getDeviceNotificationToken());
            this.userProducer.publishToQueueDefault(this.chatDeviceNewQueue, messageToChatBroker);

            // 204
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // 500
            if (e instanceof UserNotFoundError) {
                return ResponseEntity.status(404).body(
                        new EndpointResponse<>(404, e.getMessage(), null)
                );
            }
            return ResponseEntity.status(500).body(
                    new EndpointResponse<>(500, e.getMessage(), null)
            );
        }
    }

}
