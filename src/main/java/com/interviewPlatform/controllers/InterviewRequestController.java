package com.interviewPlatform.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewPlatform.dtos.request.InterviewRequestDTO;
import com.interviewPlatform.entities.InterviewRequest;
import com.interviewPlatform.enums.Status;
import com.interviewPlatform.services.InterviewRequestService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/interview-requests")
@RequiredArgsConstructor
public class InterviewRequestController {
    private final InterviewRequestService interviewRequestService;

    @PostMapping
    public ResponseEntity<String> createRequest(
            @RequestBody InterviewRequestDTO dto) {

        interviewRequestService.createRequest(dto);

        return ResponseEntity.ok("Interview request submitted successfully");
    }

    @GetMapping
    public ResponseEntity<List<InterviewRequest>> getRequests() {
        return ResponseEntity.ok(
                interviewRequestService.getMyRequests()
        );
    }

    @GetMapping("/pending-count")
    public ResponseEntity<Long> getPendingCount() {
        return ResponseEntity.ok(
                interviewRequestService.getPendingCount()
        );
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<String> confirmRequest(@PathVariable Long id){
        interviewRequestService.updateStatus(id, Status.CONFIRMED);
        return ResponseEntity.ok("Request Confirmed");
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelRequest(@PathVariable Long id){
        interviewRequestService.updateStatus(id, Status.CANCELLED);
        return ResponseEntity.ok("Request Cancelled");
    } 

}
