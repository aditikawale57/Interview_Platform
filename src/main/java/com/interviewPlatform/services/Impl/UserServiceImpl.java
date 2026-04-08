package com.interviewPlatform.services.Impl;

import java.util.Date;
import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.interviewPlatform.dtos.request.RegisterRequest;
import com.interviewPlatform.dtos.response.AuthResponse;
import com.interviewPlatform.dtos.response.RegisterResponse;
import com.interviewPlatform.entities.RefreshToken;
import com.interviewPlatform.entities.User;
import com.interviewPlatform.repositories.RefreshTokenRepositotry;
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
    private final RefreshTokenRepositotry refreshTokenRepositotry;

    

    @Override
    public RegisterResponse registerUser(RegisterRequest request) {
        // check duplicate email
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        User user=new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());

       User savedUser= userRepository.save(user);

        return new RegisterResponse(
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getRole()
        );

    }



    @Override
    public AuthResponse verify(User user) {
        //Authenticate User
        Authentication authentication=authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));

        if(authentication.isAuthenticated()){
            //Generate both tokens
        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

             //Fetch role from DB
        User dbUser = userRepository.findByEmail(user.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

        //save refresh token in DB
        RefreshToken token=new RefreshToken();
        token.setToken(refreshToken);
        token.setUsername(dbUser.getEmail());
        token.setExpiryDate(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 7));

        refreshTokenRepositotry.save(token);

        return new AuthResponse(
            accessToken,
            refreshToken,
            dbUser.getEmail(),
            dbUser.getRole().name()
        );
        }
            

        throw new RuntimeException("Invalid credentials");
    }



    @Override
    public User findByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
}
}
