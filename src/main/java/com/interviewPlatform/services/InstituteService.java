package com.interviewPlatform.services;

import com.interviewPlatform.dtos.request.InstituteRegisterRequest;

public interface InstituteService {
    void registerInstitute(InstituteRegisterRequest dto);
    String getOrCreateRegistrationLink(Long instituteId);
    boolean validateRegistrationToken(Long instituteId, String token);

}
