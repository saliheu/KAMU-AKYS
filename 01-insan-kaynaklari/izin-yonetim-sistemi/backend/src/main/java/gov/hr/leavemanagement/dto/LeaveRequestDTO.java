package gov.hr.leavemanagement.dto;

import gov.hr.leavemanagement.entity.LeaveRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeaveRequestDTO {
    private Long id;
    private UserDTO user;
    private LeaveRequest.LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private String reason;
    private LeaveRequest.LeaveStatus status;
    private UserDTO approvedBy;
    private LocalDateTime approvedAt;
    private String approvalComment;
    private String rejectionReason;
    private String attachmentPath;
    private Boolean halfDay;
    private LeaveRequest.HalfDayPeriod halfDayPeriod;
    private UserDTO substituteUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}