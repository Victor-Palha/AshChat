package com.ashchat.auth_service_spring.security;

import org.junit.jupiter.api.Test;

public class HashDeviceTokenTest {

    @Test
    public void should_be_able_to_hash_device_token() {
        final String deviceTokenToHash = "Hello There";
        try{
            final String deviceTokenHashed = HashDeviceToken.hash(deviceTokenToHash);
            assert deviceTokenHashed.equals("abf5dacd019d2229174f1daa9e62852554ab1b955fe6ae6bbbb214bab611f6f5");
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
