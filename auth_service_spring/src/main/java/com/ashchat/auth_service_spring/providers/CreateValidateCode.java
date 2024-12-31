package com.ashchat.auth_service_spring.providers;
import java.util.Random;

public class CreateValidateCode {
    public static String generateEmailCodeHelper() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return Integer.toString(code);
    }
}
