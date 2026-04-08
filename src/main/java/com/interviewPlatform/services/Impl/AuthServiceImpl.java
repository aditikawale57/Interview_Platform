package com.interviewPlatform.services.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.interviewPlatform.dtos.request.InstituteRegisterRequest;
import com.interviewPlatform.dtos.request.InterviewerRegisterRequest;
import com.interviewPlatform.entities.Institute;
import com.interviewPlatform.entities.Interviewer;
import com.interviewPlatform.entities.User;
import com.interviewPlatform.enums.Role;
import com.interviewPlatform.repositories.InstituteRepository;
import com.interviewPlatform.repositories.InterviewerRepository;
import com.interviewPlatform.repositories.UserRepository;
import com.interviewPlatform.services.AuthService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService{

    private final UserRepository userRepository;
    private final InstituteRepository instituteRepository;
    private final InterviewerRepository interviewerRepository;
    private final PasswordEncoder passwordEncoder;



    @Override
    public void registerInstitute(InstituteRegisterRequest request) {
        // check duplicate
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        // password validation
        if (!request.password().equals(request.confirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // create user
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.INSTITUTE);

        userRepository.save(user);

        // create institute
        Institute inst = new Institute();
        inst.setUser(user);
        inst.setInstituteName(request.instituteName());
        inst.setUniversity(request.university());
        inst.setInstituteCode(request.instituteCode());
        inst.setAddress(request.address());
        inst.setCity(request.city());
        inst.setState(request.state());
        inst.setAdminName(request.adminName());
        inst.setDesignation(request.designation());
        inst.setContactNumber(request.contactNumber());
        inst.setWebsite(request.website());
        inst.setStudentStrength(request.studentStrength());

        instituteRepository.save(inst);
    }

    @Override
    public void registerInterviewer(InterviewerRegisterRequest request) {
        if(userRepository.existsByEmail(request.email())){
            throw new RuntimeException("Email already exists");
        }

        if (!request.password().equals(request.confirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // create user
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.INTERVIEWER);

        userRepository.save(user);

        // create interviewer
        Interviewer interviewer = new Interviewer();
        interviewer.setUser(user);
        interviewer.setFullName(request.fullName());
        interviewer.setPhone(request.phone());
        interviewer.setLocation(request.location());
        interviewer.setJobTitle(request.jobTitle());
        interviewer.setCompany(request.company());
        interviewer.setExperience(request.experience());
        interviewer.setDomain(request.domain());
        interviewer.setQualification(request.qualification());
        interviewer.setLinkedin(request.linkedin());
        interviewer.setSkills(request.skills());
        interviewer.setInterviewExperience(request.interviewExperience());
        interviewer.setBio(request.bio());

        interviewerRepository.save(interviewer);
    }

}
