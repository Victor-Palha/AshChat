package com.ashchat.auth_service_spring.modules.user.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UsersController {

    @PostMapping("/signup")
    public void registerUser() {

    }

    @PostMapping("/signin")
    public void authenticateUser() {

    }
}
