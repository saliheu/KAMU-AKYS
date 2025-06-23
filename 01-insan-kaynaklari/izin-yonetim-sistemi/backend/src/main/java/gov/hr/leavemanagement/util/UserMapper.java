package gov.hr.leavemanagement.util;

import gov.hr.leavemanagement.dto.DepartmentDTO;
import gov.hr.leavemanagement.dto.UserDTO;
import gov.hr.leavemanagement.entity.Department;
import gov.hr.leavemanagement.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    
    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }
        
        return UserDTO.builder()
            .id(user.getId())
            .tcNo(user.getTcNo())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .employeeId(user.getEmployeeId())
            .role(user.getRole())
            .department(toDepartmentDTO(user.getDepartment()))
            .manager(user.getManager() != null ? toSimpleUserDTO(user.getManager()) : null)
            .startDate(user.getStartDate())
            .phone(user.getPhone())
            .position(user.getPosition())
            .annualLeaveBalance(user.getAnnualLeaveBalance())
            .usedAnnualLeave(user.getUsedAnnualLeave())
            .sickLeaveBalance(user.getSickLeaveBalance())
            .usedSickLeave(user.getUsedSickLeave())
            .isActive(user.getIsActive())
            .build();
    }
    
    private UserDTO toSimpleUserDTO(User user) {
        if (user == null) {
            return null;
        }
        
        return UserDTO.builder()
            .id(user.getId())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .employeeId(user.getEmployeeId())
            .email(user.getEmail())
            .build();
    }
    
    private DepartmentDTO toDepartmentDTO(Department department) {
        if (department == null) {
            return null;
        }
        
        return DepartmentDTO.builder()
            .id(department.getId())
            .code(department.getCode())
            .name(department.getName())
            .description(department.getDescription())
            .isActive(department.getIsActive())
            .build();
    }
}