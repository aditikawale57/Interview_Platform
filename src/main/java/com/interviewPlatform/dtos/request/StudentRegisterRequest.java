package com.interviewPlatform.dtos.request;

public record StudentRegisterRequest(
    Long instituteId,
    Long departmentId,
    String token,

    String firstName,
    String lastName,
    String email,
    String phone,

    String studentClass,
    Double cgpa,

    // String departmentName,

    String password,
    String confirmPassword
) {

}