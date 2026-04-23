package com.interviewPlatform.entities;

import java.time.LocalDateTime;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;           
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mentors")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Mentor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    
    
    private String firstName;
    private String lastName;
    private String phone;

    private String designation;
    @OneToOne
    @JoinColumn(name = "department_id", nullable = false, unique = true)
    private Department department;
    
    @ManyToOne
    @JoinColumn(name = "institute_id")
    private Institute institute;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate(){
        this.createdAt = LocalDateTime.now();
    }
    
}