package com.interviewPlatform.entities;

import java.time.LocalDateTime;
import java.util.List;

import com.interviewPlatform.enums.Status;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String departmentName;
    @ElementCollection
    private List<String> expertise;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String contactPerson;
    private String contactEmail;
    private String remarks;

    @Enumerated(EnumType.STRING)
    private Status status; 

    @ManyToOne
    @JoinColumn(name = "institute_id")
    private Institute institute;

}
