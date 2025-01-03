
package com.ashchat.auth_service_spring.modules.user.controllers;
import com.ashchat.auth_service_spring.configs.UserProducer;
import com.ashchat.auth_service_spring.constants.JWTTypes;
import com.ashchat.auth_service_spring.exceptions.InvalidCredentialsError;
import com.ashchat.auth_service_spring.exceptions.NewDeviceTryingToLogError;
import com.ashchat.auth_service_spring.modules.user.dto.AuthenticateUserDTO;
import com.ashchat.auth_service_spring.modules.user.dto.EndpointResponse;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.services.AuthenticateUserUseCase;
import com.ashchat.auth_service_spring.modules.user.services.FindUserByEmailUseCase;
import com.ashchat.auth_service_spring.providers.CreateValidateCode;
import com.ashchat.auth_service_spring.providers.HashDeviceToken;
import com.ashchat.auth_service_spring.providers.JWTProvider;
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
import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Account Security", description = "User Account Security related endpoints")
public class SigninUserController {
    // Broker Queues
    @Value("${broker.queue.email.device.new}")
    private String emailNewDeviceQueue;
    // Use Cases
    private final AuthenticateUserUseCase authenticateUserUseCase;
    private final FindUserByEmailUseCase findUserByEmailUseCase;
    // Configs
    private final JWTProvider jwtProvider;
    private final UserProducer userProducer;

    public SigninUserController(
            AuthenticateUserUseCase authenticateUserUseCase,
            JWTProvider jwtProvider,
            FindUserByEmailUseCase findUserByEmailUseCase,
            UserProducer userProducer
    ) {
        this.authenticateUserUseCase = authenticateUserUseCase;
        this.jwtProvider = jwtProvider;
        this.findUserByEmailUseCase = findUserByEmailUseCase;
        this.userProducer = userProducer;
    }

    @PostMapping("/signin")
    @Operation(summary = "Authenticate user", description = "Verify user credentials to allow access to AshChat system")
    @ApiResponse(responseCode = "200", description = "User Authenticated", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "SuccessExample",
            value = """
                    {
                      "status": 200,
                      "message": "User authenticated successfully",
                      "data": {
                        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "user_id": "187418365e002c243176de40",
                        "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                      }
                    }
            """), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "403", description = "A new device is trying to log in", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ConflictExample",
    value = """
            {
              "status": 403,
              "message": "A new device is trying to log in. Check your email to allow it.",
              "data": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "info": "To allow the new device, use the JWT temporary token and the code sent to your email to endpoint /api/user/confirm-new-device"
              }
            }"""), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "401", description = "Invalid Credentials email/password", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ConflictExample", value = "{ \"status\": 401, \"message\": \"Invalid Credentials Error\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "500", description = "Unexpected server error", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ServerErrorExample", value = "{ \"status\": 500, \"message\": \"Internal server error\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    public ResponseEntity<Object> execute(@RequestBody AuthenticateUserDTO authenticateUserDTO) throws UnsupportedEncodingException, NoSuchAlgorithmException {

        try {
            // Attempt user authentication
            String userId = this.authenticateUserUseCase.execute(authenticateUserDTO);
            // 7 days to refresh token expires
            Instant refreshExpirationTime = Instant.now().plus(Duration.ofDays(7));
            String jwtRefreshToken = this.jwtProvider.generateJWTToken(userId, JWTTypes.REFRESH, refreshExpirationTime);
            // 30 minutes until main token expires
            Instant mainExpirationTime = Instant.now().plus(Duration.ofMinutes(30));
            String jwtMainToken = this.jwtProvider.generateJWTToken(userId, JWTTypes.MAIN, mainExpirationTime);

            Map<String, String> response = new HashMap<>();
            response.put("refresh_token", jwtRefreshToken);
            response.put("token", jwtMainToken);
            response.put("user_id", userId);

            // 200
            return ResponseEntity.ok(
                    new EndpointResponse<>(200, "User authenticated successfully", response)
            );
        } catch (Exception e) {
            if (e instanceof NewDeviceTryingToLogError) {
                String user_id = handleNewDeviceLogin(authenticateUserDTO);
                if (user_id == null) {
                    // 500
                    return ResponseEntity.status(500).body(
                            new EndpointResponse<>(500, "Unexpected server error", null)
                    );
                }
                // 403
                Instant temporaryExpirationTime = Instant.now().plus(Duration.ofMinutes(10));
                String jwtTemporaryToken = this.jwtProvider.generateJWTToken(user_id, JWTTypes.TEMPORARY, temporaryExpirationTime);
                Map<String, String> response = new HashMap<>();
                response.put("token", jwtTemporaryToken);
                response.put("info", "To allow the new device, use the JWT temporary token and the code sent to your email to endpoint /api/user/confirm-new-device");
                return ResponseEntity.status(403).body(
                        new EndpointResponse<>(403, "A new device is trying to log in. Check your email to allow it.", response)
                );
            }
            if (e instanceof InvalidCredentialsError) {
                // 401
                return ResponseEntity.status(401).body(
                        new EndpointResponse<>(401, e.getMessage(), null)
                );
            }
            // 500
            return ResponseEntity.status(500).body(
                    new EndpointResponse<>(500, e.getMessage(), null)
            );
        }
    }

    private String handleNewDeviceLogin(AuthenticateUserDTO authenticateUserDTO) throws UnsupportedEncodingException, NoSuchAlgorithmException {
        // Retrieve user based on email
        Optional<UserEntity> user = this.findUserByEmailUseCase.execute(authenticateUserDTO.getEmail());
        if (user.isEmpty()) {
            return null;
        }
        // Generate hashed and secure data
        String newTokenHashed = HashDeviceToken.hash(authenticateUserDTO.getDeviceTokenId());
        String emailCodeConfirmation = CreateValidateCode.generateEmailCodeHelper();
        // Prepare message payload for the queue
        Map<String, Object> message = new HashMap<>();
        message.put("email", user.get().getEmail());
        message.put("emailCode", emailCodeConfirmation);
        message.put("deviceUniqueToken", newTokenHashed);
        message.put("nickname", user.get().getName());
        message.put("user_id", user.get().getId());
        // Publish message to the queue
        this.userProducer.publishToQueueDefault(emailNewDeviceQueue, message);
        return user.get().getId();
    }

}
