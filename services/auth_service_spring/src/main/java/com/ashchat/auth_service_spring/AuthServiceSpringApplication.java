package com.ashchat.auth_service_spring;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(
        info = @Info(
                title = "AshChat Auth Service",
                description = "Auth Service to AshChat system by: Victor Palha",
                version = "1.0"
        )
)
@SecurityScheme(
        name = "jwt_token",
        scheme = "bearer",
        bearerFormat = "JWT",
        type = SecuritySchemeType.HTTP,
        in = SecuritySchemeIn.HEADER
)
public class AuthServiceSpringApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceSpringApplication.class, args);
    }

}
