package gov.communication.meetingmanagement.dto;

import gov.communication.meetingmanagement.entity.MeetingRoom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MeetingRoomDTO {
    
    private Long id;
    private String name;
    private String location;
    private Integer capacity;
    private String equipment;
    private boolean hasProjector;
    private boolean hasVideoConference;
    private boolean hasWhiteboard;
    private boolean isAvailable;
    
    public static MeetingRoomDTO fromEntity(MeetingRoom room) {
        return MeetingRoomDTO.builder()
                .id(room.getId())
                .name(room.getName())
                .location(room.getLocation())
                .capacity(room.getCapacity())
                .equipment(room.getEquipment())
                .hasProjector(room.isHasProjector())
                .hasVideoConference(room.isHasVideoConference())
                .hasWhiteboard(room.isHasWhiteboard())
                .isAvailable(room.isAvailable())
                .build();
    }
}