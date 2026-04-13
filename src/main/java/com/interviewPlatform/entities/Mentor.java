package com.interviewPlatform.entities;

import java.time.LocalDateTime;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;           
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "mentors")
public class Mentor {
    
    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Relationships
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @OneToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
    
    // Personal Information
    private String firstName;
    private String lastName;
    private String phone;


    
    // Professional Information
    private String designation;
    // private String employeeId;
    // private String specialization;
    // private String joiningDate;
    // private Integer experienceYears;
    
    // Profile
    private String profilePhotoUrl;
    private String linkedinProfile;
    
    
   @Column(unique = true)
    private String registrationToken;

    private LocalDateTime tokenCreatedAt;
}