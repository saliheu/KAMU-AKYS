package gov.citizen.complaintmanagement.dto;

import gov.citizen.complaintmanagement.entity.ComplaintStatus;
import gov.citizen.complaintmanagement.entity.PriorityLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating a complaint
 * Şikayet güncelleme DTO'su
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintUpdateDto {

    private ComplaintStatus status;
    
    private PriorityLevel priority;
    
    private Long assignedDepartmentId;
    
    private Long assignedOfficerId;
}