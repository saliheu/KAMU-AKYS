package gov.hr.leavemanagement.util;

import gov.hr.leavemanagement.dto.LeaveRequestDTO;
import gov.hr.leavemanagement.entity.LeaveRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LeaveRequestMapper {
    
    private final UserMapper userMapper;
    
    public LeaveRequestDTO toDTO(LeaveRequest leaveRequest) {
        if (leaveRequest == null) {
            return null;
        }
        
        return LeaveRequestDTO.builder()
            .id(leaveRequest.getId())
            .user(userMapper.toDTO(leaveRequest.getUser()))
            .leaveType(leaveRequest.getLeaveType())
            .startDate(leaveRequest.getStartDate())
            .endDate(leaveRequest.getEndDate())
            .totalDays(leaveRequest.getTotalDays())
            .reason(leaveRequest.getReason())
            .status(leaveRequest.getStatus())
            .approvedBy(leaveRequest.getApprovedBy() != null ? userMapper.toDTO(leaveRequest.getApprovedBy()) : null)
            .approvedAt(leaveRequest.getApprovedAt())
            .approvalComment(leaveRequest.getApprovalComment())
            .rejectionReason(leaveRequest.getRejectionReason())
            .attachmentPath(leaveRequest.getAttachmentPath())
            .halfDay(leaveRequest.getHalfDay())
            .halfDayPeriod(leaveRequest.getHalfDayPeriod())
            .substituteUser(leaveRequest.getSubstituteUser() != null ? userMapper.toDTO(leaveRequest.getSubstituteUser()) : null)
            .createdAt(leaveRequest.getCreatedAt())
            .updatedAt(leaveRequest.getUpdatedAt())
            .build();
    }
}