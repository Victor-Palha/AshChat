package com.ashchat.auth_service_spring.providers;

import com.ashchat.auth_service_spring.constants.JWTTypes;
import com.ashchat.auth_service_spring.exceptions.InvalidTokenError;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;

@Service
public class JWTProvider {
    @Value("${api.security.token.main}")
    private String JWT_MAIN_SECRET;

    @Value("${api.security.token.public}")
    private String JWT_MAIN_PUBLIC_KEY;

    @Value("${api.security.token.temporary}")
    private String JWT_TEMPORARY_SECRET;

    @Value("${api.security.token.refresh}")
    private String JWT_REFRESH_SECRET;

    public DecodedJWT decodeTokenWithoutValidation(String token) {
        token = token.replace("Bearer ", "").trim();
        return JWT.decode(token);
    }

    public DecodedJWT validateToken(String token, JWTTypes jwtTypes) throws InvalidTokenError {
        final String jwt = token.replace("Bearer ", "").trim();

        final Algorithm algorithm = this.loadAlgorithm(jwtTypes);

        try {
            return JWT.require(algorithm)
                    .build()
                    .verify(jwt);

        } catch (JWTVerificationException error){
            throw new InvalidTokenError();
        }
    }

    public String generateJWTToken(String subject, JWTTypes jwtType, Instant expiry) {
        Algorithm algorithm = this.loadAlgorithm(jwtType);
        return JWT.create()
                .withSubject(subject)
                .withIssuer("ashchat-auth-service")
                .withClaim("type", jwtType.name())
                .withExpiresAt(expiry)
                .sign(algorithm);
    }

    private Algorithm loadAlgorithm(JWTTypes jwtType) {
        try {
            Algorithm algorithm;
            switch (jwtType) {
                case MAIN -> {
                    RSAPrivateKey privateKey = this.loadPrivateKey(JWT_MAIN_SECRET);
                    RSAPublicKey publicKey = this.loadPublicKey(JWT_MAIN_PUBLIC_KEY);
                    algorithm = Algorithm.RSA256(publicKey, privateKey);
                }
                case TEMPORARY -> algorithm = Algorithm.HMAC256(JWT_TEMPORARY_SECRET);
                case REFRESH -> algorithm = Algorithm.HMAC256(JWT_REFRESH_SECRET);
                default -> throw new IllegalArgumentException("Invalid JWT Type");
            }
            return algorithm;
        } catch (Exception e) {
            throw new RuntimeException("Error loading algorithm", e);
        }
    }

    private RSAPrivateKey loadPrivateKey(String fileName) throws Exception {
        ClassPathResource resource = new ClassPathResource(fileName);

        try (InputStream inputStream = resource.getInputStream()) {
            byte[] keyBytes = inputStream.readAllBytes();
            String privateKeyPEM = new String(keyBytes)
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] decoded = Base64.getDecoder().decode(privateKeyPEM);
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decoded);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");

            return (RSAPrivateKey) keyFactory.generatePrivate(keySpec);
        }
    }

    private RSAPublicKey loadPublicKey(String fileName) throws Exception {
        ClassPathResource resource = new ClassPathResource(fileName);
        try (InputStream inputStream = resource.getInputStream()) {
            byte[] keyBytes = inputStream.readAllBytes();
            String publicKeyPEM = new String(keyBytes)
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] decoded = Base64.getDecoder().decode(publicKeyPEM);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decoded);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return (RSAPublicKey) keyFactory.generatePublic(keySpec);
        }
    }
}
