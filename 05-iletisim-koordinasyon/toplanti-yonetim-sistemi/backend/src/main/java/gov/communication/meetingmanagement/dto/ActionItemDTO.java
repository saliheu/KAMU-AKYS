package gov.communication.meetingmanagement.dto;

import gov.communication.meetingmanagement.entity.ActionItem;
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
public class ActionItemDTO {
    
    private Long id;
    private String description;
    private UserDTO assignedTo;
    private LocalDate dueDate;
    private ActionItem.ActionStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static ActionItemDTO fromEntity(ActionItem actionItem) {
        return ActionItemDTO.builder()
                .id(actionItem.getId())
                .description(actionItem.getDescription())
                .assignedTo(UserDTO.fromEntity(actionItem.getAssignedTo()))
                .dueDate(actionItem.getDueDate())
                .status(actionItem.getStatus())
                .notes(actionItem.getNotes())
                .createdAt(actionItem.getCreatedAt())
                .updatedAt(actionItem.getUpdatedAt())
                .build();
    }
}