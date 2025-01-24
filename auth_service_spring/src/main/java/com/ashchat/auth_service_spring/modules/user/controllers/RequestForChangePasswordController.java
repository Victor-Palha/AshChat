package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.configs.UserProducer;
import com.ashchat.auth_service_spring.constants.JWTTypes;
import com.ashchat.auth_service_spring.exceptions.UserNotFoundError;
import com.ashchat.auth_service_spring.modules.user.dto.EndpointResponse;
import com.ashchat.auth_service_spring.modules.user.dto.RequestForChangePasswordDTO;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.services.FindUserByEmailUseCase;
import com.ashchat.auth_service_spring.providers.CreateValidateCode;
import com.ashchat.auth_service_spring.providers.JWTProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Account Security", description = "User Account Security related endpoints")
public class RequestForChangePasswordController {
    // broker queue
    @Value("${broker.queue.email.password.change}")
    private String changePasswordQueue;
    //use case
    private final FindUserByEmailUseCase findUserByEmailUseCase;
    // Configs
    private final UserProducer userProducer;
    final private JWTProvider jwtProvider;

    public RequestForChangePasswordController(UserProducer userProducer,
                                              FindUserByEmailUseCase findUserByEmailUseCase, JWTProvider jwtProvider) {
        this.userProducer = userProducer;
        this.findUserByEmailUseCase = findUserByEmailUseCase;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping("/password")
    @Operation(summary = "Request to change user password", description = "Receives the email code and token to reset the user password", responses = {
    @ApiResponse(responseCode = "202", description = "Verification email is being processed", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "Success", value = "{ \"status\": 202, \"message\": \"Verification email is being processed\", \"data\": { \"token\": \"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...\" } }"),schema = @Schema(implementation = EndpointResponse.class))),
    @ApiResponse(responseCode = "400", description = "Invalid Email Code", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "InvalidEmailCode", value = "{ \"status\": 400, \"message\": \"Invalid Email Code\", \"data\": null }"),schema = @Schema(implementation = EndpointResponse.class))),
    @ApiResponse(responseCode = "404", description = "User Not Found", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "UserNotFound", value = "{ \"status\": 404, \"message\": \"User not found\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class))),
    @ApiResponse(responseCode = "500", description = "Unexpected server error", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ServerError", value = "{ \"status\": 500, \"message\": \"Internal server error\", \"data\": null }"),schema = @Schema(implementation = EndpointResponse.class)))})
    public ResponseEntity<Object> execute(@Valid @RequestBody RequestForChangePasswordDTO requestForChangePasswordDTO) {
        try {
            Optional<UserEntity> user = findUserByEmailUseCase.execute(requestForChangePasswordDTO.getEmail());
            if(user.isEmpty()){
                throw new UserNotFoundError();
            }
            HashMap<String, Object> messageToBroker = new HashMap<>();
            final String validateCode = CreateValidateCode.generateEmailCodeHelper();
            messageToBroker.put("email", user.get().getEmail());
            messageToBroker.put("user_id", user.get().getId());
            messageToBroker.put("nickname", user.get().getName());
            messageToBroker.put("emailCode", validateCode);

            this.userProducer.publishToQueueDefault(
                    this.changePasswordQueue,
                    messageToBroker
            );

            Instant temporaryExpirationTime = Instant.now().plus(Duration.ofMinutes(10));
            String temporaryToken = jwtProvider.generateJWTToken(
                    user.get().getId(),
                    JWTTypes.TEMPORARY,
                    temporaryExpirationTime
            );

            HashMap<String, Object> response = new HashMap<>();
            response.put("token", temporaryToken);

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(
                    new EndpointResponse<>(HttpStatus.ACCEPTED.value(), "Verification email is being processed", response)
            );
        }
        catch (UserNotFoundError e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new EndpointResponse<>(HttpStatus.NOT_FOUND.value(), e.getMessage(), null)
            );
        }
        catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new EndpointResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), e.getMessage(), null)
            );
        }
    }
}
