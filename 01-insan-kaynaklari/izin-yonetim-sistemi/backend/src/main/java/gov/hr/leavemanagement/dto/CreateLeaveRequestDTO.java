package gov.hr.leavemanagement.dto;

import gov.hr.leavemanagement.entity.LeaveRequest;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLeaveRequestDTO {
    
    @NotNull(message = "Leave type is required")
    private LeaveRequest.LeaveType leaveType;
    
    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDate endDate;
    
    private String reason;
    
    private Boolean halfDay = false;
    
    private LeaveRequest.HalfDayPeriod halfDayPeriod;
    
    private Long substituteUserId;
    
    private String attachmentPath;
}