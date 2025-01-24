package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.configs.UserProducer;
import com.ashchat.auth_service_spring.exceptions.UserNotFoundError;
import com.ashchat.auth_service_spring.modules.user.dto.ConfirmChangePasswordDTO;
import com.ashchat.auth_service_spring.modules.user.dto.ConfirmPasswordBrokerResponseDTO;
import com.ashchat.auth_service_spring.modules.user.dto.EndpointResponse;
import com.ashchat.auth_service_spring.modules.user.services.ChangeUserPasswordUseCase;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
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
            return buildResponse(400, e.getMessage(), null);
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

