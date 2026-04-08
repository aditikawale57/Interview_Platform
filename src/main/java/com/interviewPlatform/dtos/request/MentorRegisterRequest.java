package com.interviewPlatform.dtos.request;

public record MentorRegisterRequest(
    Long instituteId,
    String token,

    String firstName,
    String lastName,
    String email,
    String phone,

    String departmentName,
    String designation,

    String password,
    String confirmPassword
) {

}
