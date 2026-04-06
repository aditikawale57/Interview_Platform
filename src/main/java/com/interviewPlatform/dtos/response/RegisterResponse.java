package com.interviewPlatform.dtos.response;

import com.interviewPlatform.enums.Role;

public record RegisterResponse(
    Long id,
    String username,
    Role role
) {

}
