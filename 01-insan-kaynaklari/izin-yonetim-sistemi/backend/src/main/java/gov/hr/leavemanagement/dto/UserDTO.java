package gov.hr.leavemanagement.dto;

import gov.hr.leavemanagement.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String tcNo;
    private String email;
    private String firstName;
    private String lastName;
    private String employeeId;
    private User.Role role;
    private DepartmentDTO department;
    private UserDTO manager;
    private LocalDate startDate;
    private String phone;
    private String position;
    private Integer annualLeaveBalance;
    private Integer usedAnnualLeave;
    private Integer sickLeaveBalance;
    private Integer usedSickLeave;
    private Boolean isActive;
}