package gov.citizen.complaintmanagement.dto;

import gov.citizen.complaintmanagement.entity.ComplaintType;
import gov.citizen.complaintmanagement.entity.PriorityLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new complaint
 * Yeni şikayet oluşturma DTO'su
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintCreateDto {

    @NotBlank(message = "Subject is required")
    @Size(min = 5, max = 200, message = "Subject must be between 5 and 200 characters")
    private String subject;

    @NotBlank(message = "Description is required")
    @Size(min = 10, message = "Description must be at least 10 characters")
    private String description;

    @NotNull(message = "Complaint type is required")
    private ComplaintType type;

    private PriorityLevel priority;

    private Long departmentId;

    private Boolean isAnonymous;
}