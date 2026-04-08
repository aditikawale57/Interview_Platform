package com.interviewPlatform.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.interviewPlatform.entities.Interviewer;
import com.interviewPlatform.entities.User;

public interface InterviewerRepository extends JpaRepository<Interviewer,Long>{
    Optional<Interviewer> findByUser(User user);

}
