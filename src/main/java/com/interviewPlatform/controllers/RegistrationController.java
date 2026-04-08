package com.interviewPlatform.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewPlatform.dtos.request.InstituteRegisterRequest;
import com.interviewPlatform.dtos.request.InterviewerRegisterRequest;
import com.interviewPlatform.services.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/register")
@RequiredArgsConstructor
public class RegistrationController {

    private final AuthService authService;

    @PostMapping("/institute")
    public ResponseEntity<?> registerInstitute(@RequestBody InstituteRegisterRequest request){
        authService.registerInstitute(request);
        return ResponseEntity.ok("Institute Registered Successfully");
    }

    @PostMapping("/interviewer")
    public ResponseEntity<?> registerInterviewer(@RequestBody InterviewerRegisterRequest request){
        authService.registerInterviewer(request);
        return ResponseEntity.ok("Interviewer Registered Successfully");
    }

}
