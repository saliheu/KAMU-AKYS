package gov.communication.meetingmanagement.dto;

import gov.communication.meetingmanagement.entity.Meeting;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateMeetingRequest {
    
    @Size(max = 200, message = "Toplantı başlığı en fazla 200 karakter olabilir")
    private String title;
    
    @Size(max = 1000, message = "Açıklama en fazla 1000 karakter olabilir")
    private String description;
    
    @Future(message = "Başlangıç zamanı gelecekte olmalıdır")
    private LocalDateTime startTime;
    
    @Future(message = "Bitiş zamanı gelecekte olmalıdır")
    private LocalDateTime endTime;
    
    private Long roomId;
    
    private Meeting.MeetingType type;
    
    @Size(max = 200, message = "Konum en fazla 200 karakter olabilir")
    private String location;
    
    @Pattern(regexp = "^(https?://)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([/\\w \\.-]*)*/?$", 
            message = "Geçerli bir URL giriniz")
    private String onlineLink;
    
    private String agenda;
    
    private Boolean sendReminder;
    
    @Min(value = 5, message = "Hatırlatma süresi en az 5 dakika olmalıdır")
    @Max(value = 10080, message = "Hatırlatma süresi en fazla 1 hafta olabilir")
    private Integer reminderMinutes;
    
    private List<Long> participantIds;
    
    @AssertTrue(message = "Bitiş zamanı başlangıç zamanından sonra olmalıdır")
    private boolean isEndTimeAfterStartTime() {
        if (startTime == null || endTime == null) {
            return true;
        }
        return endTime.isAfter(startTime);
    }
}