package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.configs.UserProducer;
import com.ashchat.auth_service_spring.constants.JWTTypes;
import com.ashchat.auth_service_spring.exceptions.InvalidCredentialsError;
import com.ashchat.auth_service_spring.exceptions.NewDeviceTryingToLogError;
import com.ashchat.auth_service_spring.exceptions.UserWithSameCredentialsAlreadyExists;
import com.ashchat.auth_service_spring.modules.user.dto.*;
import com.ashchat.auth_service_spring.modules.user.entity.UserEntity;
import com.ashchat.auth_service_spring.modules.user.services.AuthenticateUserUseCase;
import com.ashchat.auth_service_spring.modules.user.services.CreateNewUserUseCase;
import com.ashchat.auth_service_spring.modules.user.services.CreateTempUserUseCase;
import com.ashchat.auth_service_spring.modules.user.services.FindUserByEmailUseCase;
import com.ashchat.auth_service_spring.providers.JWTProvider;
import com.ashchat.auth_service_spring.providers.CreateValidateCode;
import com.ashchat.auth_service_spring.providers.HashDeviceToken;
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

    // Dependencies
    // Use cases
    final private CreateTempUserUseCase createTempUserUseCase;
    final private CreateNewUserUseCase createNewUserUseCase;
    final private AuthenticateUserUseCase authenticateUserUseCase;
    final private FindUserByEmailUseCase findUserByEmailUseCase;
    // Config
    final private UserProducer userProducer;
    final private JWTProvider jwtProvider;
    public UsersController(
            CreateTempUserUseCase createTempUserUseCase,
            CreateNewUserUseCase createNewUserUseCase,
            UserProducer userProducer,
            AuthenticateUserUseCase authenticateUserUseCase,
            JWTProvider jwtProvider,
            FindUserByEmailUseCase findUserByEmailUseCase
    ) {
        this.createTempUserUseCase = createTempUserUseCase;
        this.createNewUserUseCase = createNewUserUseCase;
        this.userProducer = userProducer;
        this.authenticateUserUseCase = authenticateUserUseCase;
        this.jwtProvider = jwtProvider;
        this.findUserByEmailUseCase = findUserByEmailUseCase;
    }

    @PostMapping("/signup")
    public ResponseEntity<Object> registerUser(@RequestBody CreateTempNewUserDTO tempUserDTO) {
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

    @PostMapping("/confirm-email")
    public ResponseEntity<Object> confirmEmailAndValidateAccount(@RequestBody ConfirmEmailAndValidateAccountDTO confirmEmailAndValidateAccountDTO) {
        try{

            Map<String, Object> message = createMessageToBroker(confirmEmailAndValidateAccountDTO);

            ConfirmEmailBrokerResponseDTO response = this.userProducer.publishToRPCQueue(
                    this.emailConfirmationQueue,
                    message, ConfirmEmailBrokerResponseDTO.class
            );
            
            if (!response.getSuccess()) {
                return ResponseEntity.status(400).body(response.getMessage());
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
            System.out.println(userCreated);
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

            Map<String, String> responseMessage = new HashMap<>();
            responseMessage.put("message", "Account created successfully");

            return ResponseEntity.status(201).body(responseMessage);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<Object> authenticateUser(@RequestBody AuthenticateUserDTO authenticateUserDTO) throws UnsupportedEncodingException, NoSuchAlgorithmException {
        try{
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
            return ResponseEntity.ok(response);
        }
        catch (Exception e){
            if (e instanceof NewDeviceTryingToLogError) {
                String user_id = newDeviceTryingToSignin(authenticateUserDTO);
                if(user_id == null){
                    // 500
                    return ResponseEntity.status(500).body(e.getMessage());
                }
                // 403
                Instant temporaryExpirationTime = Instant.now().plus(Duration.ofMinutes(10));
                String jwtTemporaryToken = this.jwtProvider.generateJWTToken(user_id, JWTTypes.TEMPORARY, temporaryExpirationTime);
                Map<String, String> response = new HashMap<>();
                response.put("token", jwtTemporaryToken);
                response.put("message", "A new device is trying to log in. Check your email to allow it.");
                response.put("info", "To allow the new device, use the JWT temporary token and the code sent to your email to endpoint /api/user/confirm-new-device");
                return ResponseEntity.status(403).body(response);
            }
            if (e instanceof InvalidCredentialsError){
                // 401
                return ResponseEntity.status(401).body(e.getMessage());
            }
            // 500
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/hello")
    @PreAuthorize("hasRole('REFRESH')")
    public String hello() {
        return "Hello World!";
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

    private String newDeviceTryingToSignin (AuthenticateUserDTO authenticateUserDTO) throws UnsupportedEncodingException, NoSuchAlgorithmException {
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
