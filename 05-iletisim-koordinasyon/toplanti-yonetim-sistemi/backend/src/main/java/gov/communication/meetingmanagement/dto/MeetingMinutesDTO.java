package gov.communication.meetingmanagement.dto;

import gov.communication.meetingmanagement.entity.MeetingMinutes;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MeetingMinutesDTO {
    
    private Long id;
    private String content;
    private String decisions;
    private UserDTO createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static MeetingMinutesDTO fromEntity(MeetingMinutes minutes) {
        return MeetingMinutesDTO.builder()
                .id(minutes.getId())
                .content(minutes.getContent())
                .decisions(minutes.getDecisions())
                .createdBy(UserDTO.fromEntity(minutes.getCreatedBy()))
                .createdAt(minutes.getCreatedAt())
                .updatedAt(minutes.getUpdatedAt())
                .build();
    }
}