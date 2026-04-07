package com.interviewPlatform.services.Impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.interviewPlatform.dtos.request.RegisterRequest;
import com.interviewPlatform.dtos.response.AuthResponse;
import com.interviewPlatform.dtos.response.RegisterResponse;
import com.interviewPlatform.entities.User;
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
        user.setRole(request.role());

       User savedUser= userRepository.save(user);

        return new RegisterResponse(
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getRole()
        );

    }



    @Override
    public AuthResponse verify(User user) {
        Authentication authentication=authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));

        if(authentication.isAuthenticated()){
            //  Generate both tokens
        String accessToken = jwtService.generateAccessToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

             //Fetch role from DB
        User dbUser = userRepository.findByUsername(user.getUsername());

        return new AuthResponse(
            accessToken,
            refreshToken,
            dbUser.getUsername(),
            dbUser.getRole().name()
        );
        }
            

        throw new RuntimeException("Invalid credentials");
    }



    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

}
