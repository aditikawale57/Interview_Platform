package com.interviewPlatform.services.Impl;

import java.time.LocalDateTime;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.interviewPlatform.dtos.request.MentorRegisterRequest;
import com.interviewPlatform.entities.Department;
import com.interviewPlatform.entities.Institute;
import com.interviewPlatform.entities.User;
import com.interviewPlatform.enums.Role;
import com.interviewPlatform.enums.Status;
import com.interviewPlatform.repositories.DepartmentRepository;
import com.interviewPlatform.repositories.InstituteRepository;
import com.interviewPlatform.repositories.UserRepository;
import com.interviewPlatform.services.MentorService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MentorServiceImpl implements MentorService {

    private final UserRepository userRepository;
    private final InstituteRepository instituteRepository;
    private final DepartmentRepository departmentRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    @Override
    public void registerTpo(MentorRegisterRequest dto) {
        // 1. Validate password
    if (!dto.password().equals(dto.confirmPassword())) {
        throw new RuntimeException("Passwords do not match");
    }

    // 2. Validate institute
    Institute institute = instituteRepository.findById(dto.instituteId())
        .orElseThrow(() -> new RuntimeException("Institute not found"));

    // 3. Validate token
    if (!dto.token().equals(institute.getRegistrationToken())) {
        throw new RuntimeException("Invalid token");
    }

    // 4. Token expiry (optional but recommended)
    if (institute.getTokenCreatedAt().plusHours(24).isBefore(LocalDateTime.now())) {
        throw new RuntimeException("Token expired");
    }

    // 5. Find department
    Department dept = departmentRepository
        .findByNameAndInstituteId(dto.departmentName(), dto.instituteId())
        .orElseThrow(() -> new RuntimeException("Department not found"));

    // 6. Check if TPO already exists
    if (dept.getTpo() != null) {
        throw new RuntimeException("TPO already assigned for this department");
    }

    // 7. Check email
    if (userRepository.findByEmail(dto.email()).isPresent()) {
        throw new RuntimeException("Email already registered");
    }

    // 8. Create user
    User user = new User();
    // user.setName(dto.firstName() + " " + dto.lastName());
    user.setEmail(dto.email());
    // user.setPhone(dto.phone());
    user.setPassword(passwordEncoder.encode(dto.password()));
    user.setRole(Role.MENTOR);
    user.setStatus(Status.ACTIVE);

    User savedUser = userRepository.save(user);

    // 9. Assign to department
    dept.setTpo(savedUser);
    departmentRepository.save(dept);

    }


}
