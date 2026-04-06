package com.interviewPlatform.services.Impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.interviewPlatform.dtos.request.RegisterRequest;
import com.interviewPlatform.dtos.response.RegisterResponse;
import com.interviewPlatform.entities.User;
import com.interviewPlatform.enums.Role;
import com.interviewPlatform.repositories.UserRepository;
import com.interviewPlatform.services.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JWTService jwtService;
    private final  UserRepository userRepository;

    

    @Override
    public RegisterResponse registerUser(RegisterRequest request) {
        // if (userRepository.findByUsername(request.username()).isPresent()) {
        //     throw new RuntimeException("Username already exists");
        // }

        User user=new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);

       User savedUser= userRepository.save(user);

        return new RegisterResponse(
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getRole()
        );

    }



    @Override
    public String verify(User user) {
        Authentication authentication=authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));

        if(authentication.isAuthenticated())
            return jwtService.generateToken(user.getUsername());

        return "fail";
    }

}
