package gov.communication.meetingmanagement.dto;

import gov.communication.meetingmanagement.entity.Meeting;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MeetingDTO {
    
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private UserDTO organizer;
    private MeetingRoomDTO room;
    private Meeting.MeetingType type;
    private Meeting.MeetingStatus status;
    private String location;
    private String onlineLink;
    private String agenda;
    private boolean sendReminder;
    private Integer reminderMinutes;
    private boolean isRecurring;
    private Meeting.RecurrenceType recurrenceType;
    private Integer recurrenceInterval;
    private LocalDateTime recurrenceEndDate;
    private List<UserDTO> participants;
    private List<MeetingAttachmentDTO> attachments;
    private MeetingMinutesDTO minutes;
    private List<ActionItemDTO> actionItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static MeetingDTO fromEntity(Meeting meeting) {
        return MeetingDTO.builder()
                .id(meeting.getId())
                .title(meeting.getTitle())
                .description(meeting.getDescription())
                .startTime(meeting.getStartTime())
                .endTime(meeting.getEndTime())
                .organizer(UserDTO.fromEntity(meeting.getOrganizer()))
                .room(meeting.getRoom() != null ? MeetingRoomDTO.fromEntity(meeting.getRoom()) : null)
                .type(meeting.getType())
                .status(meeting.getStatus())
                .location(meeting.getLocation())
                .onlineLink(meeting.getOnlineLink())
                .agenda(meeting.getAgenda())
                .sendReminder(meeting.isSendReminder())
                .reminderMinutes(meeting.getReminderMinutes())
                .isRecurring(meeting.isRecurring())
                .recurrenceType(meeting.getRecurrenceType())
                .recurrenceInterval(meeting.getRecurrenceInterval())
                .recurrenceEndDate(meeting.getRecurrenceEndDate())
                .participants(meeting.getParticipants().stream()
                        .map(UserDTO::fromEntity)
                        .collect(Collectors.toList()))
                .attachments(meeting.getAttachments().stream()
                        .map(MeetingAttachmentDTO::fromEntity)
                        .collect(Collectors.toList()))
                .minutes(meeting.getMinutes() != null ? MeetingMinutesDTO.fromEntity(meeting.getMinutes()) : null)
                .actionItems(meeting.getActionItems().stream()
                        .map(ActionItemDTO::fromEntity)
                        .collect(Collectors.toList()))
                .createdAt(meeting.getCreatedAt())
                .updatedAt(meeting.getUpdatedAt())
                .build();
    }
}