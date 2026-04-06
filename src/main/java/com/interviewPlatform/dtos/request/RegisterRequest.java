package com.interviewPlatform.dtos.request;

import com.interviewPlatform.enums.Role;

public record RegisterRequest(
    String username,
    String password,
    Role role
) {

}
