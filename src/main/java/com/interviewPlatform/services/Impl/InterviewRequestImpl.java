package com.interviewPlatform.services.Impl;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.interviewPlatform.dtos.request.InterviewRequestDTO;
import com.interviewPlatform.entities.Institute;
import com.interviewPlatform.entities.InterviewRequest;
import com.interviewPlatform.enums.Status;
import com.interviewPlatform.repositories.InstituteRepository;
import com.interviewPlatform.repositories.InterviewRequestRepository;
import com.interviewPlatform.services.InterviewRequestService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewRequestImpl implements InterviewRequestService {

    private final InterviewRequestRepository requestRepo;
    private final InstituteRepository instituteRepo;

    private Institute getLoggedInInstitute() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return instituteRepo.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Institute not found"));
    }

    @Override
    public void createRequest(InterviewRequestDTO dto) {
        Institute institute = getLoggedInInstitute();

        InterviewRequest request = new InterviewRequest();

        request.setDepartmentName(dto.departmentName());
        request.setExpertise(dto.expertise());
        request.setStartDate(dto.startDate());
        request.setEndDate(dto.endDate());
        request.setContactPerson(dto.contactPerson());
        request.setContactEmail(dto.contactEmail());
        request.setRemarks(dto.remarks());

        request.setStatus(Status.PENDING);

        request.setInstitute(institute);

        requestRepo.save(request);
    }

    @Override
    public List<InterviewRequest> getMyRequests() {
        Institute institute = getLoggedInInstitute();

        return requestRepo.findByInstituteId(institute.getId());
    }

    @Override
    public long getPendingCount() {
        Institute institute = getLoggedInInstitute();

        return requestRepo.countByInstituteIdAndStatus(
                institute.getId(),
                Status.PENDING
        );
    }

    @Override
    public void updateStatus(Long id, Status status) {
        InterviewRequest req = requestRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));

            req.setStatus(status);

            requestRepo.save(req);
    }

}
