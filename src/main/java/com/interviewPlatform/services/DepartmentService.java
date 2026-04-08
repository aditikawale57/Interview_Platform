package com.interviewPlatform.services;

import java.util.List;

import com.interviewPlatform.dtos.request.DepartmentRequestDTO;
import com.interviewPlatform.dtos.response.DepartmentResponseDTO;

public interface DepartmentService {
    DepartmentResponseDTO createDepartment(DepartmentRequestDTO dto);
    List<DepartmentResponseDTO> getDepartments(Long instituteId);
    void deleteDepartment(Long id);

}
