package com.interviewPlatform.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RestController;

import com.interviewPlatform.dtos.request.RegisterRequest;
import com.interviewPlatform.entities.User;
import com.interviewPlatform.services.UserService;

import lombok.RequiredArgsConstructor;

@RestController

@RequiredArgsConstructor
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request){
        userService.registerUser(request);
        return ResponseEntity.ok("User registered successfully");

    }

    @PostMapping("/login")
    public String login(@RequestBody User user){
        
        return userService.verify(user);

    }

}
