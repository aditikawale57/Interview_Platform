package com.interviewPlatform.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewPlatform.dtos.request.MentorRegisterRequest;
import com.interviewPlatform.services.MentorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/register")
@RequiredArgsConstructor
@CrossOrigin
public class MentorController {

    private final MentorService mentorService;

    @PostMapping("/mentor")
    public ResponseEntity<?> registerMentor(@RequestBody MentorRegisterRequest request){
         try {
            mentorService.registerMentor(request);
            return ResponseEntity.ok("Mentor registered successfully");
        } catch (RuntimeException ex) {

            if (ex.getMessage().contains("Mentor already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
            }

            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


}
