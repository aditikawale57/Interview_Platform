package com.interviewPlatform.services.Impl;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.interviewPlatform.dtos.request.InterviewerRegisterRequest;
import com.interviewPlatform.entities.Interviewer;
import com.interviewPlatform.entities.User;
import com.interviewPlatform.enums.Role;
import com.interviewPlatform.enums.Status;
import com.interviewPlatform.repositories.InterviewerRepository;
import com.interviewPlatform.repositories.UserRepository;
import com.interviewPlatform.services.InterviewerService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewerServiceImpl implements InterviewerService {
    
    private final UserRepository userRepository;
    private final InterviewerRepository interviewerRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public String registerInterviewer(InterviewerRegisterRequest dto) {
        //1.check email
        if(userRepository.findByEmail(dto.email()).isPresent()){
            throw new RuntimeException("Email already exists!!");
        }

        //2.save user
        User user= new User();
        // user.setName(dto.fullName());
        user.setEmail(dto.email());
        // user.setPhone(dto.phone());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setRole(Role.INTERVIEWER);
        user.setStatus(Status.ACTIVE);

       User savedUser= userRepository.save(user);

       //3.save interviwer
       Interviewer interviewer=new Interviewer();
       interviewer.setUser(savedUser);
       interviewer.setLocation(dto.location());
       interviewer.setJobTitle(dto.jobTitle());
       interviewer.setCompany(dto.company());
       interviewer.setExperience(dto.experience());
       interviewer.setDomain(dto.domain());
       interviewer.setQualification(dto.qualification());
       interviewer.setLinkedin(dto.linkedin());
       interviewer.setSkills(dto.skills());
       interviewer.setInterviewExperience(dto.interviewExperience());
       interviewer.setBio(dto.bio());

       // 4. Handle Image Upload
        // try {
        //     if (dto.profilePhoto() != null && !dto.profilePhoto().isEmpty()) {

        //         String fileName = System.currentTimeMillis() + "_" +
        //                 dto.profilePhoto().getOriginalFilename();

        //         Path path = Paths.get("uploads/" + fileName);
        //         Files.createDirectories(path.getParent());
        //         Files.write(path, dto.profilePhoto().getBytes());

        //         interviewer.setProfilePhoto(fileName);
        //     }
        // } catch (Exception e) {
        //     throw new RuntimeException("File upload failed");
        // }

        interviewerRepository.save(interviewer);

        return "Interviewer registered successfully!";
    }


}
