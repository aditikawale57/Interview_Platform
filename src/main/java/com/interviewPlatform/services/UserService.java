package com.interviewPlatform.services;

import com.interviewPlatform.dtos.request.RegisterRequest;
import com.interviewPlatform.dtos.response.AuthResponse;
import com.interviewPlatform.dtos.response.RegisterResponse;
import com.interviewPlatform.entities.User;

public interface UserService {
    public RegisterResponse registerUser(RegisterRequest request);

    public AuthResponse verify(User user);

    public User findByEmail(String email);

}
