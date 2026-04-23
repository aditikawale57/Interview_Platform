package com.interviewPlatform.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class PageController {

    @GetMapping("/")
    public String home(){
        return "index";
    }

    @GetMapping("/login")
    public String loginPage(){
        return "login";
    }

    @GetMapping("/register")
    public String registerPage(){
        return "register";
    }

    @GetMapping("/register/mentor")
    public String mentorRegistrationPage(@RequestParam String token, Model model){
        model.addAttribute("token",token);
        return "mentor-registration";
    }

    @GetMapping("/institute-dashboard")
    public String instituteDashboard(){
        return "institute-dashboard";
    }

    @GetMapping("/admin-dashboard")
    public String adminDashboard(){
        return "admin-dashboard";
    }

    @GetMapping("/student-dashboard")
    public String studentDashboard(){
        return "student-dashboard";
    }

    @GetMapping("/mentor-dashboard")
    public String mentorDashboard(){
        return "mentor-dashboard";
    }

    @GetMapping("/interviewer-dashboard")
    public String interviewerDashboard(){
        return "interviewer-dashboard";
    }

}
