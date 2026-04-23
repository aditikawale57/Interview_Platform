package com.interviewPlatform.services;

import java.util.List;

import com.interviewPlatform.dtos.request.InterviewRequestDTO;
import com.interviewPlatform.entities.InterviewRequest;
import com.interviewPlatform.enums.Status;

public interface InterviewRequestService {
    void createRequest(InterviewRequestDTO dto);

    List<InterviewRequest> getMyRequests();

    long getPendingCount();

    void updateStatus(Long id, Status status);

}
