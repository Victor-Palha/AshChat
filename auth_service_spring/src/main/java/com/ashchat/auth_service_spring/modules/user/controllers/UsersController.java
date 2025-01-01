package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.configs.UserProducer;
import com.ashchat.auth_service_spring.constants.JWTTypes;
import com.ashchat.auth_service_spring.exceptions.InvalidCredentialsError;
import com.ashchat.auth_service_spring.exceptions.NewDeviceTryingToLogError;
import com.ashchat.auth_service_spring.exceptions.UserWithSameCredentialsAlreadyExists;
import com.ashchat.auth_service_spring.modules.user.dto.*;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.services.*;
import com.ashchat.auth_service_spring.providers.JWTProvider;
import com.ashchat.auth_service_spring.providers.CreateValidateCode;
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
import org.springframework.web.bind.annotation.*;

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
public class UsersController {
    // Queues to Message Broker
    @Value("${broker.queue.email.creation}")
    private String emailCreationQueue;
    @Value("${broker.queue.email.code.confirm}")
    private String emailConfirmationQueue;
    @Value("${broker.queue.email.creation.confirm}")
    private String emailConfirmationQueueCreation;
    @Value("${broker.queue.email.device.new}")
    private String emailNewDeviceQueue;
    @Value("${broker.queue.email.device.confirm}")
    private String emailDeviceConfirmationQueue;
    // Dependencies
    // Use cases
    final private CreateTempUserUseCase createTempUserUseCase;
    final private CreateNewUserUseCase createNewUserUseCase;
    final private AuthenticateUserUseCase authenticateUserUseCase;
    final private FindUserByEmailUseCase findUserByEmailUseCase;
    final private ChangeDeviceInformationFromUserAccountUseCase changeDeviceInformationFromUserAccountUseCase;
    // Config
    final private UserProducer userProducer;
    final private JWTProvider jwtProvider;

    public UsersController(
            CreateTempUserUseCase createTempUserUseCase,
            CreateNewUserUseCase createNewUserUseCase,
            UserProducer userProducer,
            AuthenticateUserUseCase authenticateUserUseCase,
            JWTProvider jwtProvider,
            FindUserByEmailUseCase findUserByEmailUseCase,
            ChangeDeviceInformationFromUserAccountUseCase changeDeviceInformationFromUserAccountUseCase
    ) {
        this.createTempUserUseCase = createTempUserUseCase;
        this.createNewUserUseCase = createNewUserUseCase;
        this.userProducer = userProducer;
        this.authenticateUserUseCase = authenticateUserUseCase;
        this.jwtProvider = jwtProvider;
        this.findUserByEmailUseCase = findUserByEmailUseCase;
        this.changeDeviceInformationFromUserAccountUseCase = changeDeviceInformationFromUserAccountUseCase;
    }

    @PostMapping("/signup")
    @Operation(
            summary = "Register a new user account",
            description = "This endpoint create a temporary user account and send a e-mail with a code to validate " +
                    "identity"
    )
    @ApiResponse(
            responseCode = "202",
            description = "Verification email is being processed",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "SuccessExample",
                            value = "{ \"status\": 202, \"message\": \"Verification email is being processed\", \"data\": null }"
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    @ApiResponse(
            responseCode = "409",
            description = "User with same credentials already exists",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "ConflictExample",
                            value = "{ \"status\": 409, \"message\": \"User already exists\", \"data\": null }"
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    @ApiResponse(
            responseCode = "500",
            description = "Unexpected server error",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "ServerErrorExample",
                            value = "{ \"status\": 500, \"message\": \"Internal server error\", \"data\": null }"
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    public ResponseEntity<EndpointResponse<String>> registerUser(@RequestBody CreateTempNewUserDTO tempUserDTO) {
        try {
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

            return ResponseEntity.ok(
                    new EndpointResponse<>(202, "Verification email is being processed", null)
            );
        } catch (Exception e) {
            if (e instanceof UserWithSameCredentialsAlreadyExists) {
                return ResponseEntity.status(409).body(
                        new EndpointResponse<>(409, "User with same credentials already exists", null)
                );
            }
            HashMap<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(
                    new EndpointResponse<>(500, "Unexpected server error", null)
            );
        }
    }

    @PostMapping("/confirm-email")
    @Operation(
            summary = "Receive the email code from the user",
            description = "If email code matches with the code that was send then create the user account"
    )
    @ApiResponse(
            responseCode = "201",
            description = "User Account Created",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "SuccessExample",
                            value = "{ \"status\": 201, \"message\": \"Account created successfully\", " +
                                    "\"data\": null }"
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Error with email code validation",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "ConflictExample",
                            value = "{ \"status\": 400, \"message\": \"Invalid email code\", \"data\": null }"
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    @ApiResponse(
            responseCode = "409",
            description = "User with same credentials already register on system",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "ConflictExample",
                            value = "{ \"status\": 409, \"message\": \"User with same credentials already register\"," +
                                    " \"data\": null }"
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    @ApiResponse(
            responseCode = "500",
            description = "Unexpected server error",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "ServerErrorExample",
                            value = "{ \"status\": 500, \"message\": \"Internal server error\", \"data\": null }"
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    public ResponseEntity<EndpointResponse<String>> confirmEmailAndValidateAccount(@RequestBody ConfirmEmailAndValidateAccountDTO confirmEmailAndValidateAccountDTO) {
        try {

            Map<String, Object> message = createMessageToBroker(confirmEmailAndValidateAccountDTO);

            ConfirmEmailBrokerResponseDTO response = this.userProducer.publishToRPCQueue(
                    this.emailConfirmationQueue,
                    message, ConfirmEmailBrokerResponseDTO.class
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

    @PostMapping("/signin")
    @Operation(
            summary = "Authenticate user",
            description = "Verify user credentials to allow access to AshChat system"
    )
    @ApiResponse(
            responseCode = "200",
            description = "User Authenticated",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "SuccessExample",
                            value = """
                                    {
                                      "status": 200,
                                      "message": "User authenticated successfully",
                                      "data": {
                                        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                        "user_id": "187418365e002c243176de40",
                                        "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                                      }
                                    }"""
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    @ApiResponse(
            responseCode = "403",
            description = "A new device is trying to log in",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "ConflictExample",
                            value = """
                                    {
                                      "status": 403,
                                      "message": "A new device is trying to log in. Check your email to allow it.",
                                      "data": {
                                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                        "info": "To allow the new device, use the JWT temporary token and the code sent to your email to endpoint /api/user/confirm-new-device"
                                      }
                                    }"""
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    @ApiResponse(
            responseCode = "401",
            description = "Invalid Credentials email/password",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "ConflictExample",
                            value = "{ \"status\": 401, \"message\": \"Invalid Credentials Error\"," +
                                    " \"data\": null }"
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    @ApiResponse(
            responseCode = "500",
            description = "Unexpected server error",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "ServerErrorExample",
                            value = "{ \"status\": 500, \"message\": \"Internal server error\", \"data\": null }"
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    public ResponseEntity<EndpointResponse> authenticateUser(@RequestBody AuthenticateUserDTO authenticateUserDTO) throws UnsupportedEncodingException, NoSuchAlgorithmException {
        try {
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
                String user_id = newDeviceTryingToSignin(authenticateUserDTO);
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

    @PostMapping("/confirm-new-device")
    @PreAuthorize("hasRole('TEMPORARY')")
    @Operation(
            summary = "Confirm new device to link account",
            description = "Receives the email code and link the new device to the user account"
    )
    @ApiResponse(
            responseCode = "204",
            description = "New device was confirmed"
    )
    @ApiResponse(
            responseCode = "403",
            description = "Invalid Email Code",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "ConflictExample",
                            value = "{ \"status\": 403, \"message\": \"Invalid Email Code\"," +
                                    " \"data\": null }"
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    @ApiResponse(
            responseCode = "500",
            description = "Unexpected server error",
            content =
            @Content(
                    mediaType = "application/json",
                    examples =
                    @ExampleObject(
                            name = "ServerErrorExample",
                            value = "{ \"status\": 500, \"message\": \"Internal server error\", \"data\": null }"
                    ),
                    schema = @Schema(implementation = EndpointResponse.class))
    )
    @SecurityRequirement(name = "jwt_auth")
    public ResponseEntity<Object> confirmNewDeviceAuth(
            HttpServletRequest request,
            @RequestBody ConfirmNewDeviceAuthDTO confirmNewDeviceAuthDTO
    ) throws UnsupportedEncodingException, NoSuchAlgorithmException {
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
            // 204
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // 500
            return ResponseEntity.status(500).body(
                    new EndpointResponse<>(500, e.getMessage(), null)
            );
        }
    }

    @GetMapping("/hello")
    @PreAuthorize("hasRole('REFRESH')")
    public String hello(HttpServletRequest request) {
        final String userId = request.getAttribute("user_id").toString();
        return "Hello " + userId;
    }

    // Helper Methods to controllers
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

    private String newDeviceTryingToSignin(AuthenticateUserDTO authenticateUserDTO) throws UnsupportedEncodingException, NoSuchAlgorithmException {
        Optional<UserEntity> user = this.findUserByEmailUseCase.execute(authenticateUserDTO.getEmail());
        if (user.isEmpty()) {
            return null;
        }
        String newTokenHashed = HashDeviceToken.hash(authenticateUserDTO.getDeviceTokenId());
        String emailCodeConfirmation = CreateValidateCode.generateEmailCodeHelper();

        Map<String, Object> message = new HashMap<>();
        message.put("email", user.get().getEmail());
        message.put("emailCode", emailCodeConfirmation);
        message.put("deviceUniqueToken", newTokenHashed);
        message.put("nickname", user.get().getName());
        message.put("user_id", user.get().getId());

        this.userProducer.publishToQueueDefault(emailNewDeviceQueue, message);
        return user.get().getId();
    }
}
