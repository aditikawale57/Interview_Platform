package com.interviewPlatform.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RestController;

import com.interviewPlatform.dtos.request.RegisterRequest;
import com.interviewPlatform.dtos.response.AuthResponse;
import com.interviewPlatform.entities.User;
import com.interviewPlatform.services.UserService;
import com.interviewPlatform.services.Impl.JWTService;

import lombok.RequiredArgsConstructor;

@RestController

@RequiredArgsConstructor
public class AuthController {
   
    private final UserService userService;
    private final JWTService jwtService;


    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request){
        userService.registerUser(request);
        return ResponseEntity.ok("User registered successfully");

    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody User user){
        
        AuthResponse response=userService.verify(user);
        return ResponseEntity.ok(response);

    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestBody Map<String, String> request) {

        String refreshToken = request.get("refreshToken");

        String username = jwtService.extractUserName(refreshToken);

        // Validate refresh token
        if (!jwtService.isTokenExpired(refreshToken)) {

            String newAccessToken = jwtService.generateAccessToken(username);

            // Fetch role from DB
            User user = userService.findByUsername(username);

            return new AuthResponse(
                    newAccessToken,
                    refreshToken, // you can reuse same refresh token
                    username,
                    user.getRole().name()
            );
        }

        throw new RuntimeException("Refresh token expired. Please login again.");
    }

}
