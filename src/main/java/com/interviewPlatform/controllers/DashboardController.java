package com.interviewPlatform.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    @GetMapping("/admin/dashboard")
    public String adminDashboard(){
        return "Welcome Admin";
    }

    @GetMapping("/user/dashboard")
    public String userDashboard(){
        return "Welcome User";
    }

}
