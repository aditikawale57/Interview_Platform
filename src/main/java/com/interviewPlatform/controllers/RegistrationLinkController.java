package com.interviewPlatform.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import com.interviewPlatform.services.InstituteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/register")
@RequiredArgsConstructor
public class RegistrationLinkController {
    private final InstituteService instituteService;

    @GetMapping("/institutes/{id}/registration-link")
    public ResponseEntity<String> generateLink(@PathVariable Long id) {
        String link = instituteService.getOrCreateRegistrationLink(id);
        return ResponseEntity.ok(link);
    }

    // Validate token 
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(
            @RequestParam Long instId,
            @RequestParam String token) {

        boolean isValid = instituteService.validateRegistrationToken(instId, token);

        if (isValid) {
            return ResponseEntity.ok("Valid token");
        } else {
            return ResponseEntity.badRequest().body("Invalid token");
        }
    }

}
