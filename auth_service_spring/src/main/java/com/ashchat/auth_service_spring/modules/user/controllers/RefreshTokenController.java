package com.ashchat.auth_service_spring.modules.user.controllers;

import com.ashchat.auth_service_spring.constants.JWTTypes;
import com.ashchat.auth_service_spring.exceptions.UserNotFoundError;
import com.ashchat.auth_service_spring.modules.user.dto.EndpointResponse;
import com.ashchat.auth_service_spring.modules.user.services.CompareDeviceTokenIdFromUserUseCase;
import com.ashchat.auth_service_spring.providers.JWTProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Account Security", description = "User Account Security related endpoints")
public class RefreshTokenController {

    final private CompareDeviceTokenIdFromUserUseCase compareDeviceTokenIdFromUserUseCase;
    final private JWTProvider jwtProvider;
    public RefreshTokenController(CompareDeviceTokenIdFromUserUseCase compareDeviceTokenIdFromUserUseCase, JWTProvider jwtProvider){
        this.compareDeviceTokenIdFromUserUseCase = compareDeviceTokenIdFromUserUseCase;
        this.jwtProvider = jwtProvider;
    }

    @PreAuthorize("hasRole('REFRESH')")
    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh user token", description = "Refresh the tokens for the user if credentials are valid")
    @ApiResponse(responseCode = "200", description = "Valid Refresh", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "SuccessExample",
            value = """
                    {
                      "status": 200,
                      "message": "Valid Refresh",
                      "data": {
                        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                      }
                    }
            """), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "401", description = "Invalid Device Token", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ConflictExample", value = "{ \"status\": 401, \"message\": \"Invalid Device Token\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "404", description = "User Not Found", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ConflictExample", value = "{ \"status\": 404, \"message\": \"User Not Found\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    @ApiResponse(responseCode = "500", description = "Unexpected server error", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "ServerErrorExample", value = "{ \"status\": 500, \"message\": \"Internal server error\", \"data\": null }"), schema = @Schema(implementation = EndpointResponse.class)))
    @SecurityRequirement(name = "jwt_auth")
    public ResponseEntity<Object> execute(HttpServletRequest request, @RequestHeader("device_token") String deviceTokenId){
        final String userId = request.getAttribute("user_id").toString();
        if (deviceTokenId == null) {
            return ResponseEntity.status(401).body(
                    new EndpointResponse<>(401, "Invalid Device Token", null)
            );
        }
        try{
            boolean isAValidToken = compareDeviceTokenIdFromUserUseCase.execute(userId, deviceTokenId);
            if (isAValidToken){
                // 7 days to refresh token expires
                Instant refreshExpirationTime = Instant.now().plus(Duration.ofDays(7));
                String jwtRefreshToken = this.jwtProvider.generateJWTToken(userId, JWTTypes.REFRESH, refreshExpirationTime);
                // 30 minutes until main token expires
                Instant mainExpirationTime = Instant.now().plus(Duration.ofMinutes(30));
                String jwtMainToken = this.jwtProvider.generateJWTToken(userId, JWTTypes.MAIN, mainExpirationTime);

                Map<String, String> response = new HashMap<>();
                response.put("refresh_token", jwtRefreshToken);
                response.put("token", jwtMainToken);

                return ResponseEntity.ok(
                        new EndpointResponse<>(200, "Valid Refresh", response)
                );
            }
            else{
                return ResponseEntity.status(401).body(
                        new EndpointResponse<>(401, "Invalid Device Token", null)
                );
            }
        }
        catch (Exception e){
            if (e instanceof UserNotFoundError){
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
