package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.configs.UserProducer;
import com.ashchat.auth_service_spring.exceptions.UserNotFoundError;
import com.ashchat.auth_service_spring.modules.user.dto.ConfirmChangePasswordDTO;
import com.ashchat.auth_service_spring.modules.user.dto.ConfirmPasswordBrokerResponseDTO;
import com.ashchat.auth_service_spring.modules.user.dto.EndpointResponse;
import com.ashchat.auth_service_spring.modules.user.services.ChangeUserPasswordUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Account Security", description = "User Account Security related endpoints")
public class ConfirmChangePasswordController {

    @Value("${broker.queue.email.password.confirm}")
    private String confirmChangePasswordEmail;

    private final ChangeUserPasswordUseCase changeUserPasswordUseCase;
    private final UserProducer userProducer;

    public ConfirmChangePasswordController(ChangeUserPasswordUseCase changeUserPasswordUseCase, UserProducer userProducer) {
        this.changeUserPasswordUseCase = changeUserPasswordUseCase;
        this.userProducer = userProducer;
    }

    @PatchMapping("/password")
    @PreAuthorize("hasRole('TEMPORARY')")
    @Operation(summary = "Confirm and change user password", description = "Validates an email code and changes the user's password. Requires a temporary token with the 'TEMPORARY' role.", security = @SecurityRequirement(name = "jwt_auth"), requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Payload containing the email code and the new password.", required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = ConfirmChangePasswordDTO.class), examples = @ExampleObject(name = "RequestExample", value = "{ \"emailCode\": \"123456\", \"newPassword\": \"NewSecurePassword123!\" }"))), responses = {
    @ApiResponse(responseCode = "200", description = "Password successfully changed", content =
    @Content(mediaType = "application/json", examples = @ExampleObject(name = "Success", value = "{ \"status\": 200, \"message\": \"Password Changed\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class))),
    @ApiResponse(responseCode = "400", description = "Invalid email code or broker response error", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "InvalidEmailCode", value = "{ \"status\": 400, \"message\": \"Invalid email code\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class))),
    @ApiResponse(responseCode = "404", description = "User not found", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "UserNotFound", value = "{ \"status\": 404, \"message\": \"User not found\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class))),
    @ApiResponse(responseCode = "500", description = "Unexpected server error", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ServerError", value = "{ \"status\": 500, \"message\": \"Internal server error\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))})
    public ResponseEntity<EndpointResponse<Object>> execute(
            HttpServletRequest request,
            @Valid @RequestBody ConfirmChangePasswordDTO confirmChangePasswordDTO
    ) {
        String userId = request.getAttribute("user_id").toString();

        try {
            ConfirmPasswordBrokerResponseDTO responseBroker = sendMessageToBroker(confirmChangePasswordDTO, userId);

            if (!responseBroker.getSuccess()) {
                return buildResponse(400, responseBroker.getMessage(), null);
            }

            changeUserPasswordUseCase.execute(confirmChangePasswordDTO.getNewPassword(), userId);
            return buildResponse(200, "Password Changed", null);

        } catch (UserNotFoundError e) {
            return buildResponse(404, e.getMessage(), null);
        } catch (Exception e) {
            return buildResponse(500, e.getMessage(), null);
        }
    }

    private ConfirmPasswordBrokerResponseDTO sendMessageToBroker(ConfirmChangePasswordDTO confirmChangePasswordDTO, String userId) {
        Map<String, Object> messageToBroker = Map.of(
                "emailCode", confirmChangePasswordDTO.getEmailCode(),
                "user_id", userId
        );

        return userProducer.publishToRPCQueue(
                this.confirmChangePasswordEmail,
                messageToBroker,
                ConfirmPasswordBrokerResponseDTO.class
        );
    }

    private ResponseEntity<EndpointResponse<Object>> buildResponse(int status, String message, Object data) {
        return ResponseEntity.status(status).body(new EndpointResponse<>(status, message, data));
    }
}

